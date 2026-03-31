# Precepts Bible Study App

A locally-run web application that guides users through **Kay Arthur's Precepts Inductive Bible Study Method** for any Bible passage. It fetches text from the YouVersion API, uses a local LLM (Ollama) for stage-by-stage Socratic guidance, and persists study sessions in a local SQLite database.

---

## Features

- **6-Stage Inductive Study Flow** — Prayer & First Read → Key Word Marking → 5 W's & H Interrogation → Context & Cross-References → Interpretation → Application
- **Visual Highlighting** — 10 Precepts-style marking categories (God/Father, Jesus/Messiah, Holy Spirit, People, Sin/Evil, Salvation/Promise, Commands, Location, Time, Contrast Words), each with colour and Unicode symbol, inspired by the [Precepts Scotland marking system](https://www.preceptscotland.org/samples/key_word_marking_symbols.pdf)
- **LLM Guidance** — Ollama (`deepseek-r1:8b`) acts as a Socratic study facilitator — asking questions, not giving answers; `<think>` tags are stripped before display
- **Session History** — sidebar history of all past studies, session creation locked to a single translation to preserve highlight offsets
- **Stale Stage Regeneration** — navigating back and editing an earlier stage marks downstream AI guidance stale; regeneration happens automatically on stage entry or on demand
- **Denomination Lens** — optional prompt adjustment for denominational context
- **Bias Disclosure** — persistent tooltip noting that AI suggestions may carry training-data denominational assumptions

---

## Architecture

```
Browser (React + Vite)
  ├── Sidebar (session history)
  ├── PassageView (highlighted text canvas)
  ├── VerseInput (USFM passage selector)
  └── StageGuide (LLM guidance panel)
          │
          ▼
Node.js / Express  (port 3001)
  ├── GET  /api/verse          → YouVersion API proxy (SQLite-cached)
  ├── POST /api/llm-guide      → Ollama chat proxy
  └── CRUD /api/sessions       → SQLite sessions store
          │
          ├── SQLite DB  (sessions, highlights, stage_notes, cross_refs)
          └── Ollama     (localhost:11434) ── deepseek-r1:8b
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| State | Zustand 5 |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via `better-sqlite3` |
| LLM | Ollama — `deepseek-r1:8b` (128K context, `<think>` reasoning) |
| Bible Text | YouVersion REST API (USFM format) |
| Testing | Vitest (unit/integration) + Playwright (E2E) |

---

## Quick Start

See [RUNBOOK.md](RUNBOOK.md) for full setup and daily-use instructions.

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Start dev servers (client :5173 + server :3001)
npm run dev
```

### Quality Gate (before push)

```bash
npm test
npm run build
npm run test:e2e
```

Current baseline on this repository:
- Unit/integration: 16 passing (10 client + 6 server)
- E2E: 4 Playwright scenarios

---

## Project Structure

```
precepts-bible-study-app/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx          # Root shell — all stages wired
│   │   ├── store/           # Zustand store (sessions, highlights, staleStages)
│   │   ├── hooks/           # useHighlight, useSelection, useLLM, useSession
│   │   └── components/      # Sidebar, PassageView, VerseInput, StageGuide
│   └── vitest.config.ts
├── server/                  # Express API
│   ├── src/
│   │   ├── app.ts           # createApp factory (dependency-injectable)
│   │   ├── db/              # AppDatabase class + schema.sql
│   │   ├── routes/          # bible.ts, sessions.ts, llm.ts
│   │   └── lib/             # promptBuilder.ts, llm.ts (think-tag stripping)
│   └── tsconfig.json
├── e2e/                     # Playwright E2E specs
│   ├── study-flow.spec.ts
│   ├── polish-smoke.spec.ts
│   └── stale-regeneration.spec.ts
├── PLAN.md                  # Full implementation plan & design decisions
├── RUNBOOK.md               # Setup, run, and test instructions
└── playwright.config.ts
```

---

## Bible Translations

Default is **NASB2020** (ID `2692`), the canonical Precepts study translation licensed via the Lockman Foundation. Additional licensed translations:

| Abbreviation | Name | ID |
|---|---|---|
| **NASB2020** *(default)* | New American Standard Bible 2020 | 2692 |
| NASB1995 | New American Standard Bible 1995 | 100 |
| AMP | Amplified Bible | 1588 |
| LBLA | La Biblia de las Américas | 89 |
| NBLA | Nueva Biblia de las Américas | 103 |

Translation is **locked at session creation** to preserve highlight character offsets.

---

## Passage Size Rules

| Rule | Behaviour |
|---|---|
| Minimum | Single verse (e.g., `JHN.3.16`) |
| Maximum | One full chapter (e.g., `ROM.8`) |
| Multi-chapter range | Clipped to first chapter with warning |
| Very long chapter (e.g., Psalm 119) | Capped at 50 verses with prompt to split |

---

## Bias Disclosure

This app uses a general-purpose language model whose suggestions reflect patterns in published Bible commentary and may carry denominational assumptions. Always verify observations against the text itself.

---

## Publish To GitHub (Same Repo Name)

This folder is named `precepts-bible-study-app`; create/use a GitHub repo with the same name.

```bash
# From project root
git init
git add .
git commit -m "Initial commit"

# Replace YOUR_USERNAME with your GitHub username/org
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/precepts-bible-study-app.git
git push -u origin main
```

If you prefer HTTPS remote URLs:

```bash
git remote add origin https://github.com/YOUR_USERNAME/precepts-bible-study-app.git
git push -u origin main
```

Pre-push checklist:
- `.env` is not tracked (already ignored)
- `node_modules`, build outputs, and test artifacts are ignored
- `npm test`, `npm run build`, and `npm run test:e2e` pass locally
