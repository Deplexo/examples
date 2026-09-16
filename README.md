# Deplexo examples

Small, independently deployable applications for Deplexo. Use a starter as your own repository, understand how it works, and customize it.

[Browse templates](#starters) · [Documentation](https://docs.deplexo.com) · [Contribute](CONTRIBUTING.md)

## Starters

- [Next.js portfolio](templates/nextjs-portfolio): A personal site with project stories and a writing section.
- [Next.js website](templates/nextjs-website): A complete product website with a server-rendered contact page.
- [Go Telegram bot](templates/go-telegram-bot): A gotgbot starter with /start, /help, and /ping commands.
- [Go Discord bot](templates/go-discord-bot): A DiscordGo starter with guild-scoped slash commands.
- [Go HTTP API](templates/go-http-api): A small JSON API using the Go standard library.
- [Express API](templates/node-express): An Express 5 backend with validation and health checks.
- [FastAPI API](templates/python-fastapi): A typed Python API with automatic OpenAPI documentation.
- [Static personal website](templates/static-site): A fast, dependency-free personal homepage.

## Create your own application

Use the deployment button in a starter README or export a folder locally:

```sh
git clone https://github.com/Deplexo/examples.git
cd examples
node scripts/export.mjs nextjs-portfolio ../my-portfolio
cd ../my-portfolio
npm ci
npm run dev
```

The exporter refuses an existing destination and includes the MIT license and source provenance. Each starter is independent; you do not need the rest of this repository. GitHub's repository template button copies the whole collection, so use a specific starter export instead.

## Catalog

`template.json` contains display metadata, configuration input descriptions, service type, and suggested runtime memory. `deplexo.yaml` and the Dockerfile define deployment behavior. Run `npm ci && npm run catalog` to validate metadata and generate catalog.json and deterministic deployment bundles. The generated catalog and bundles are portable artifacts for integrations. Deploy the exported starters through the existing repository import flow.

## Verification

Run `npm run validate` and `npm test`, followed by each application's tests and container build. CI repeats these checks on pull requests and weekly. Bot interaction tests require your own Telegram/Discord test credentials and are separate from build verification.

Dependency updates do not automatically change exported applications. Review and update your copy. Memory guidance is a starting point, not a pricing promise or a capacity guarantee.

MIT licensed. See [LICENSE](LICENSE).
