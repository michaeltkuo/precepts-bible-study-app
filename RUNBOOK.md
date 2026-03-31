# Precepts Bible Study App — Runbook

Operational reference for setting up, running, and testing the app locally.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | `node --version` |
| npm | ≥ 10 | Comes with Node 20 |
| Ollama | latest | [ollama.com/download](https://ollama.com/download) |
| YouVersion API key | — | [developers.youversion.com](https://developers.youversion.com) |

### Pull the LLM model

```bash
ollama pull deepseek-r1:8b   # ~5.2 GB, ~6 GB RAM required at inference time
```

Verify Ollama is running:

```bash
ollama list   # should show deepseek-r1:8b
curl http://localhost:11434/api/tags   # health check
```

> **Alternative models** — if you don't have enough RAM for 8B, `llama3.2:3b` or `qwen2.5:3b` will work but produce lower-quality guidance. Update `OLLAMA_MODEL` in `.env` accordingly.

---

## First-Time Setup

```bash
# 1. Clone / open the workspace
cd /path/to/precepts-bible-study-app

# 2. Install all workspaces at once
npm install

# 3. Create your environment file
cp .env.example .env
```

Edit `.env` and fill in your values:

```dotenv
YOUVERSION_API_KEY=your_key_here          # Required — get from developers.youversion.com
OLLAMA_BASE_URL=http://localhost:11434    # Default — change if Ollama runs elsewhere
OLLAMA_MODEL=deepseek-r1:8b              # Default model
DEFAULT_BIBLE_ID=2692                    # 2692 = NASB2020 (recommended)
DEFAULT_BIBLE_ABBREV=NASB2020
PORT=3001                                # Express server port
```

> **Never commit `.env` to source control.** It is already in `.gitignore`.

---

## Running the App

### Start both servers (recommended)

```bash
npm run dev
```

This runs `client` (Vite, port **5173**) and `server` (Express, port **3001**) concurrently.

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Start servers individually

```bash
npm run dev:server   # Express only → http://localhost:3001
npm run dev:client   # Vite only    → http://localhost:5173
```

### Stopping

`Ctrl+C` stops both servers when using `npm run dev`.

---

## Building for Production

```bash
npm run build
```

Builds both workspaces:
- `client/dist/` — static assets (serve with any static file server)
- `server/dist/` — compiled JS (run with `node server/dist/index.js`)

---

## Running Tests

### All unit and integration tests

```bash
npm test
```

Runs Vitest in both `client` and `server` workspaces. Expected output: **16 tests passing**.

| Suite | Count | Location |
|---|---|---|
| Client unit tests | 10 | `client/src/**/*.test.ts` |
| Server unit + integration | 6 | `server/src/**/*.test.ts` |

### Client tests only

```bash
npm test --workspace client
```

### Server tests only

```bash
npm test --workspace server
```

### Playwright E2E tests

Playwright starts isolated app servers automatically for test runs:
- server on `127.0.0.1:3001`
- client on `127.0.0.1:4173`

```bash
npm run test:e2e
```

Expected output: **4 tests passing** across 3 spec files.

| Spec | Tests | What it covers |
|---|---|---|
| `study-flow.spec.ts` | Full 6-stage navigation, session creation | Core study flow |
| `polish-smoke.spec.ts` | Keyboard shortcut (⌘+]), bias disclosure tooltip | Polish & accessibility |
| `stale-regeneration.spec.ts` | Stale banner, auto-regen on stage entry, badge clears | Stale stage lifecycle |

#### First-time Playwright setup

If you haven't installed the Playwright browser yet:

```bash
npx playwright install chromium
```

#### Run a single spec

```bash
npx playwright test e2e/study-flow.spec.ts
```

#### Run with Playwright UI (interactive)

```bash
npx playwright test --ui
```

---

## API Reference

All endpoints are served by Express on `http://localhost:3001`.

### `GET /api/verse`

Fetch Bible passage text. Results are cached in SQLite after the first request.

| Param | Type | Example | Notes |
|---|---|---|---|
| `bibleId` | string | `2692` | Defaults to `DEFAULT_BIBLE_ID` from env |
| `usfm` | string | `JHN.3.16` | USFM passage reference |

```bash
curl "http://localhost:3001/api/verse?usfm=JHN.3.16&bibleId=2692"
```

### `GET /api/sessions`

List all study sessions.

### `POST /api/sessions`

Create a new session.

```json
{ "passageRef": "JHN.3.16-21", "bibleId": "2692", "bibleAbbrev": "NASB2020" }
```

### `PATCH /api/sessions/:id`

Update a session (e.g., `stageCompleted`, `title`).

### `POST /api/llm-guide`

Request LLM guidance for the current stage.

```json
{
  "stage": 2,
  "passageRef": "JHN.3.16-21",
  "bibleAbbrev": "NASB2020",
  "passageText": "For God so loved the world...",
  "highlights": [{ "phrase": "God", "category": "god", "verseRef": "v.16" }],
  "stageNotes": [{ "stage": 1, "content": "First impressions..." }],
  "denomination": ""
}
```

---

## Common Issues

### "Cannot connect to Ollama"

- Ensure Ollama is running: `ollama serve` (or it may already be running as a system service — check with `curl http://localhost:11434/api/tags`)
- Confirm the model is pulled: `ollama list`
- Check `OLLAMA_BASE_URL` in `.env`

### "YouVersion API returned 401"

- `YOUVERSION_API_KEY` in `.env` is missing or incorrect
- Key can be obtained from [developers.youversion.com](https://developers.youversion.com)

### "Port 3001 already in use"

```bash
lsof -ti:3001 | xargs kill   # macOS/Linux
```

Or change `PORT` in `.env` and update `client/vite.config.ts` proxy target to match.

### Playwright: "Error: browserType.launch — executable doesn't exist"

```bash
npx playwright install chromium
```

### Tests fail with localStorage errors

The highlight persistence layer has a safe fallback to an in-memory Map when `localStorage` is unavailable (e.g., in test environments). If you see `SecurityError: Cannot initialize local storage`, this fallback is already in place — ensure you're on the latest code.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `YOUVERSION_API_KEY` | Yes | — | YouVersion developer API key |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama server base URL |
| `OLLAMA_MODEL` | No | `deepseek-r1:8b` | Model to use for all LLM calls |
| `DEFAULT_BIBLE_ID` | No | `2692` | Bible ID used when none is specified |
| `DEFAULT_BIBLE_ABBREV` | No | `NASB2020` | Human-readable abbreviation for the default Bible |
| `PORT` | No | `3001` | Express server port |

---

## Data Storage

SQLite database file is created automatically at `server/data/study.db` on first run. Schema:

```sql
sessions    (id, passage_ref, bible_id, created_at, title, stage_completed)
highlights  (id, session_id, start_offset, end_offset, category, note)
stage_notes (id, session_id, stage, content, updated_at)
cross_refs  (id, session_id, passage_ref, note)
```

To reset all data:

```bash
rm server/data/study.db
# Restart the server — it will recreate the file with fresh schema
```
