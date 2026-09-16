# Go Telegram bot

A long-polling Telegram bot built with gotgbot. No public endpoint is needed. Includes graceful shutdown, explicit token configuration, and examples of command handling.

[Deploy with Deplexo](https://deplexo.com/add) · [Deployment guide](https://docs.deplexo.com/guides/telegram-bot/)

## Run locally

Install Go 1.27 or newer.

```sh
go mod download
go run .
```

Set the required variables in your shell before running the application. The application does not automatically load .env files.

## Configuration

- `TELEGRAM_BOT_TOKEN` (required): Create a bot with Telegram BotFather and paste its API token.

## Container

```sh
docker build -t go-telegram-bot .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid,size=100m --env-file .env go-telegram-bot
```

Copy `.env.example` to `.env` and provide any required values before the container command. Web templates listen on port 3000. Worker templates have no public HTTP endpoint.

## Deploy your own copy

Export this starter into your own GitHub repository using the command below. Then select **Deploy with Deplexo**, import that repository, configure the required variables, and review your plan and deployment region. Your repository controls future deployments; changes to the examples collection do not automatically update your application.

To export manually, clone `Deplexo/examples` and run `node scripts/export.mjs go-telegram-bot /path/to/new-app`. Initialize and push that directory to your own Git repository, then import it in Deplexo with the Dockerfile build method and repository root `./`.

Suggested runtime memory: 128 MB. This is starting guidance, not a measured maximum or a guarantee that a specific plan is sufficient. Build memory and disk requirements differ from runtime requirements.

## Operations

Logs go to stdout/stderr. Deplexo starts a replacement after stopping the previous instance, so deployments can cause a brief interruption. Local container files are ephemeral unless a persistent volume is used. This starter does not need persistent storage.

Run one instance for this starter. Stop any local copy using the same bot credentials before deploying. Check token permissions and outbound connectivity if the bot does not respond.

## Verification and maintenance

The collection runs automated builds and tests. A passing build does not establish a successful live bot interaction; verify your bot in your own test chat or server. Inspect dependency update pull requests and keep your copy maintained.

MIT licensed. See [LICENSE](LICENSE).

## Deplexo runtime note

This bot does not serve HTTP. Deplexo currently assigns an application URL and performs a port check for all applications; the check may warn before deployment completes. Verify the bot through Telegram or Discord and the runtime logs. The assigned URL is not a bot control panel. No dummy HTTP server is required.
