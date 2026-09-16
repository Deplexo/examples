# Next.js website

A product website for a small software company: a home page, feature and workflow sections, and a contact page. Runs the Next.js App Router as a standalone Node server, with a configurable email contact link and explicit writable cache handling.

[Deploy with Deplexo](https://deplexo.com/add) · [Deployment guide](https://docs.deplexo.com/guides/nextjs/)

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Use .env.example as a configuration reference. Never commit real credentials.

## Configuration

- `CONTACT_EMAIL` (optional): Public contact email displayed by the website. Does not configure outbound email.

## Container

```sh
docker build -t nextjs-website .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid,size=100m -p 3000:3000 --env-file .env nextjs-website
```

Copy `.env.example` to `.env` and provide any required values before the container command. Web templates listen on port 3000. Worker templates have no public HTTP endpoint.

## Deploy your own copy

Export this starter into your own GitHub repository using the command below. Then select **Deploy with Deplexo**, import that repository, configure the required variables, and review your plan and deployment region. Your repository controls future deployments; changes to the examples collection do not automatically update your application.

To export manually, clone `Deplexo/examples` and run `node scripts/export.mjs nextjs-website /path/to/new-app`. Initialize and push that directory to your own Git repository, then import it in Deplexo with the Dockerfile build method and repository root `./`.

Suggested runtime memory: 512 MB. This is starting guidance, not a measured maximum or a guarantee that a specific plan is sufficient. Build memory and disk requirements differ from runtime requirements.

## Operations

Logs go to stdout/stderr. Deplexo starts a replacement after stopping the previous instance, so deployments can cause a brief interruption. Local container files are ephemeral unless a persistent volume is used. This starter does not need persistent storage.

Confirm /healthz responds after startup. Check build and runtime logs if deployment fails. Runtime environment variables are not available during image builds.

## Verification and maintenance

The collection runs automated builds and tests. A passing build does not establish a successful live bot interaction; verify your bot in your own test chat or server. Inspect dependency update pull requests and keep your copy maintained.

MIT licensed. See [LICENSE](LICENSE).
