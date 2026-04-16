# tapitapi

API Tester for everyone.

A monorepo containing the API testing framework (`core`) and a Next.js web UI (`ui`) for managing providers, endpoints, and test runs.

---

## Structure

```
tapitapi/
├── core/               TypeScript API testing framework
│   ├── shared/         HTTP client, auth strategies, assertions, logger
│   ├── scripts/        Provider scaffolding and test runner scripts
│   └── reports/        Generated test output (gitignored)
├── ui/                 Next.js frontend
├── providers/          Your provider implementations (gitignored — private)
└── fixtures/           Your request payloads (gitignored — private)
```

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (Node 20+) |
| Framework (UI) | Next.js + Tailwind CSS |
| Test runner | Vitest |
| HTTP client | Native `fetch` + thin wrapper |
| Schema validation | Zod |
| Env management | dotenv |

---

## Getting Started

```bash
# Requires Node 20+
npm install

# Copy env template and fill in your credentials
cp core/.env.example core/.env

# Run all tests
npm test

# Start the UI
npm run ui
```

---

## Adding a Provider

```bash
./core/scripts/add-provider.sh <provider-name>
```

Then complete the following:

1. Fill in `providers/<name>/config.ts` — base URL, auth strategy, env var names
2. Define zod schemas in `providers/<name>/schemas.ts`
3. Create one file per endpoint in `providers/<name>/endpoints/`
4. Write tests in `providers/<name>/tests/` — named `<resource>.<method>.test.ts`
5. Add fixtures in `fixtures/<name>/`
6. Add provider env vars to `core/.env.example`

Every test file must cover: happy path, schema validation, error paths (400/401/404), and latency SLA.

---

## License

Apache 2.0
