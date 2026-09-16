# Contributing

Open an issue to discuss a new template, or send a pull request for a correction. Keep each template independently buildable and understandable. Deplexo maintains the official catalog; a submission is not published automatically.

1. Add a folder under templates with template.json, README.md, LICENSE, Dockerfile, deplexo.yaml, .dockerignore, .gitignore, and .env.example.
2. Use one application per template. Pin dependencies and include lock files. Keep secrets out of code, images, fixtures, and screenshots.
3. Provide a local quickstart, configuration descriptions, meaningful tests, and an expected result. Use minimal permissions for integrations.
4. Run npm ci, npm run catalog, npm run validate, npm test, and the template's language tests. Test the image with a read-only root filesystem and writable /tmp.
5. Include screenshots for visual changes. Describe external prerequisites and verification limits honestly.

CI checks all templates on every pull request and weekly. Credentialed platform smoke tests belong in a trusted isolated environment and are not run for untrusted pull requests. Runtime suggestions are estimates until measured. Do not add a verified date or badge without traceable evidence.

Every exported starter includes its license. Third-party notices must be retained. Keep shared code out of starter application imports so folder export remains reliable.
