# Next.js portfolio

An editorial portfolio with a project grid, expandable case studies, an about section, and writing notes. Edit a single content file to make it yours. Exported as static HTML for a small, predictable runtime.

[Deploy with Deplexo](https://deplexo.com/add) · [Deployment guide](https://docs.deplexo.com/guides/nextjs/)

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Use .env.example as a configuration reference. Never commit real credentials.

`npm run build` exports static HTML into `out/`. Preview the production site with the container commands below; this starter does not use a Next.js server.

## Configuration

No credentials or external services are required.

## Container

```sh
docker build -t nextjs-portfolio .
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid,size=100m -p 3000:3000 --env-file .env nextjs-portfolio
```

Copy `.env.example` to `.env` and provide any required values before the container command. Web templates listen on port 3000. Worker templates have no public HTTP endpoint.

## Deploy your own copy

Export this starter into your own GitHub repository using the command below. Then select **Deploy with Deplexo**, import that repository, configure the required variables, and review your plan and deployment region. Your repository controls future deployments; changes to the examples collection do not automatically update your application.

To export manually, clone `Deplexo/examples` and run `node scripts/export.mjs nextjs-portfolio /path/to/new-app`. Initialize and push that directory to your own Git repository, then import it in Deplexo with the Dockerfile build method and repository root `./`.

Suggested runtime memory: 128 MB. This is starting guidance, not a measured maximum or a guarantee that a specific plan is sufficient. Build memory and disk requirements differ from runtime requirements.

## Operations

Logs go to stdout/stderr. Deplexo starts a replacement after stopping the previous instance, so deployments can cause a brief interruption. Local container files are ephemeral unless a persistent volume is used. This starter does not need persistent storage.

Confirm /healthz responds after startup. Check build and runtime logs if deployment fails. Runtime environment variables are not available during image builds.

## Verification and maintenance

The collection runs automated builds and tests. A passing build does not establish a successful live bot interaction; verify your bot in your own test chat or server. Inspect dependency update pull requests and keep your copy maintained.

MIT licensed. See [LICENSE](LICENSE).
