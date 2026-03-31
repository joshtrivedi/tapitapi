# tapitapi

API Tester for everyone.

A structured, extensible framework for validating and exploring HTTP APIs. Currently integrates the **dat.ai** API — a distributed browser-native AI execution platform.

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (Node 20+) |
| Test runner | Vitest |
| HTTP client | Native `fetch` + thin wrapper |
| Schema validation | Zod |
| Env management | dotenv |

---

## Project Structure

```
├── providers/              one folder per API provider (gitignored — private)
│   └── <your-provider>/
│       ├── config.ts
│       ├── schemas.ts
│       ├── endpoints/
│       └── tests/
├── shared/                 reusable http client, auth, assertions, logger
├── fixtures/               request payloads per provider (gitignored — private)
└── reports/                generated test output (gitignored)
```

---

## Getting Started

```bash
# 1. Install dependencies (requires Node 20+)
npm install

# 2. Copy env template and fill in your credentials
cp .env.example .env

# 3. Run all tests
npm test
```

---

## dat.ai

The first integrated provider is [dat.ai](https://www.dat.ai) — distributed browser-native AI infrastructure. Refer to their onboarding documentation for endpoint and authentication details.

Set your credentials in `.env`:

```
DAT_AI_API_KEY=your_key_here
DAT_AI_BASE_URL=your_base_url_here
```

---

## Running Tests

```bash
# All providers
npm test

# Single provider
npm test -- providers/<your-provider>

# Single file
npm test -- providers/<your-provider>/tests/<endpoint>.test.ts

# Watch mode
npm run test:watch
```

Set `TEST_AUDIO_FILE=/path/to/sample.wav` in `.env` to enable transcription tests.

---

## Adding a Provider

```bash
./scripts/add-provider.sh <provider-name>
```

Then complete the following:

1. Fill in `providers/<name>/config.ts` — base URL, auth strategy, env var names
2. Define zod schemas in `providers/<name>/schemas.ts`
3. Create one file per endpoint in `providers/<name>/endpoints/`
4. Write tests in `providers/<name>/tests/` — named `<resource>.<method>.test.ts`
5. Add fixtures in `fixtures/<name>/`
6. Add provider env vars to `.env.example`

Every test file must cover: happy path, schema validation, error paths (400/401/404), and latency SLA.

---

## License

Apache 2.0
