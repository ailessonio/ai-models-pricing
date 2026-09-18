# Contributing

The pricing rows in every localized README and `data/models.json` are generated from the public [AILesson LLM Price API](https://ailesson.io/llm-price/api/models).

Requirements:

- Node.js 22 or newer;
- no package installation or API key is required.

Run the checks and refresh the snapshot:

```bash
npm test
npm run update
git diff --check
```

Do not edit generated pricing rows by hand. Update `scripts/update.mjs`, its tests, or the upstream AILesson pricing interface instead. A scheduled GitHub Actions workflow checks for changes daily and commits only when the normalized model data changes.
