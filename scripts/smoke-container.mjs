import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const ownerLabel = "com.deplexo.examples.smoke-run";
const templates = new Map([
  ["nextjs-portfolio", { service: "web" }],
  ["nextjs-website", { service: "web" }],
  ["go-telegram-bot", { service: "worker", token: "TELEGRAM_BOT_TOKEN" }],
  ["go-discord-bot", { service: "worker", token: "DISCORD_BOT_TOKEN" }],
  ["go-http-api", { service: "web" }],
  ["node-express", { service: "web" }],
  ["python-fastapi", { service: "web" }],
  ["static-site", { service: "web" }],
]);

export function parseArguments(args) {
  if (args.length !== 2 || !templates.has(args[0])) {
    throw new Error("Usage: node scripts/smoke-container.mjs <known-template-id> <image-tag>");
  }
  const [id, image] = args;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._/:@-]{0,254}$/.test(image)) {
    throw new Error("Image must be a Docker image reference, without spaces or command options.");
  }
  return { id, image };
}

async function docker(args, signal) {
  const result = await execute("docker", args, {
    timeout: 15_000,
    maxBuffer: 1024 * 1024,
    signal,
    encoding: "utf8",
  });
  return result.stdout.trim();
}

async function inspect(name, signal) {
  return JSON.parse(await docker(["inspect", "--format", "{{json .}}", name], signal));
}

function assertOwnership(container, owner) {
  if (container.Config?.Labels?.[ownerLabel] !== owner) {
    throw new Error("Container ownership changed; refusing to operate on it.");
  }
}

async function checkWeb(name, owner, signal) {
  const deadline = Date.now() + 45_000;
  let lastFailure = "waiting for the application";
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    const container = await inspect(name, signal);
    assertOwnership(container, owner);
    if (!container.State.Running) {
      throw new Error(`Container exited before becoming healthy (exit ${container.State.ExitCode}).`);
    }
    const binding = container.NetworkSettings.Ports["3000/tcp"]?.find((port) => port.HostIp === "127.0.0.1");
    const port = Number(binding?.HostPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("Docker did not publish a port on 127.0.0.1.");
    }
    let healthy = true;
    for (const path of ["/healthz", "/"]) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          redirect: "manual",
          signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]),
        });
        await response.body?.cancel();
        if (response.status !== 200) {
          lastFailure = `${path} returned HTTP ${response.status}`;
          healthy = false;
          break;
        }
      } catch (error) {
        signal.throwIfAborted();
        lastFailure = `${path}: ${error.message}`;
        healthy = false;
        break;
      }
    }
    if (healthy) return;
    await delay(500, undefined, { signal });
  }
  throw new Error(`Application did not become healthy within 45 seconds: ${lastFailure}.`);
}

async function checkMissingCredentials(name, owner, token, signal) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    const container = await inspect(name, signal);
    assertOwnership(container, owner);
    if (!container.State.Running) {
      if (container.State.ExitCode !== 1 || container.State.OOMKilled || container.State.Error) {
        throw new Error(`Bot did not exit cleanly for missing configuration (exit ${container.State.ExitCode}).`);
      }
      const result = await execute("docker", ["logs", "--tail", "50", name], {
        timeout: 15_000,
        maxBuffer: 1024 * 1024,
        signal,
        encoding: "utf8",
      });
      const output = result.stdout + result.stderr;
      if (!output.includes(token) || !output.includes("required")) {
        throw new Error("Bot exited without identifying its missing required credential.");
      }
      return;
    }
    await delay(250, undefined, { signal });
  }
  throw new Error("Bot did not reject missing credentials within 10 seconds.");
}

export async function smokeContainer(id, image, signal) {
  parseArguments([id, image]);
  const template = templates.get(id);
  const owner = randomUUID();
  const name = `deplexo-smoke-${id}-${owner.slice(0, 8)}`;
  const args = [
    "create", "--name", name,
    "--label", `${ownerLabel}=${owner}`,
    "--read-only",
    "--tmpfs", "/tmp:rw,nosuid,noexec,size=100m",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--pids-limit", "128",
    "--stop-timeout", "10",
    "--init",
  ];
  if (template.service === "web") {
    args.push("--publish", "127.0.0.1::3000", "--env", "PORT=3000");
  } else {
    args.push("--network", "none", "--env", `${template.token}=`);
    if (id === "go-discord-bot") args.push("--env", "DISCORD_GUILD_ID=");
  }
  args.push(image);
  let created = false;
  let failure;
  try {
    await docker(args, signal);
    created = true;
    await docker(["start", name], signal);
    if (template.service === "web") {
      await checkWeb(name, owner, signal);
      console.log(`${id}: /healthz and / returned HTTP 200 with a read-only root and 100 MB /tmp.`);
    } else {
      await checkMissingCredentials(name, owner, template.token, signal);
      console.log(`${id}: missing credentials rejected cleanly. Live bot connectivity was not tested.`);
    }
  } catch (error) {
    failure = error;
  } finally {
    try {
      const container = await inspect(name);
      assertOwnership(container, owner);
      if (failure && created) {
        try {
          const logs = await execute("docker", ["logs", "--tail", "50", container.Id], {
            timeout: 15_000,
            maxBuffer: 1024 * 1024,
            encoding: "utf8",
          });
          if (logs.stdout) console.error(logs.stdout.trim());
          if (logs.stderr) console.error(logs.stderr.trim());
        } catch (logError) {
          console.error(`Could not read smoke container logs: ${logError.message}`);
        }
      }
      await docker(["rm", "--force", container.Id]);
    } catch (cleanupError) {
      if (created || !String(cleanupError.stderr ?? "").includes("No such object")) {
        failure = failure ? new AggregateError([failure, cleanupError], "Smoke check and cleanup failed.") : cleanupError;
      }
    }
  }
  if (failure) throw failure;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const controller = new AbortController();
  const onInterrupt = () => { process.exitCode = 130; controller.abort(); };
  const onTerminate = () => { process.exitCode = 143; controller.abort(); };
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);
  try {
    const { id, image } = parseArguments(process.argv.slice(2));
    await smokeContainer(id, image, controller.signal);
  } catch (error) {
    console.error(error instanceof AggregateError
      ? error.errors.map((cause) => cause.message).join("\n")
      : error.message);
    process.exitCode ||= 1;
  } finally {
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
  }
}
