# Precepts Bible Study App — Implementation Plan

> Created: March 28, 2026  
> Status: In progress — scope decisions resolved, ready for Phase 1

---

## 0. References & Inspiration

- **Kay Arthur's Precepts Inductive Bible Study** — the foundational methodology this app implements. The Precepts method centres on observing what the text *says* before deciding what it *means*, using structured marking, interrogation, and contextual cross-referencing.
- **Precepts Scotland Marking System** — visual key word marking symbols from [preceptscotland.org](https://www.preceptscotland.org/samples/key_word_marking_symbols.pdf), referenced as the design basis for the in-app highlighting and annotation system.
- **ChatGPT UI** — the sidebar session history pattern (persistent chat list + new session button) is used as the UX reference for session navigation.
- **Bootstrap Icons** — icon source of truth for UI symbols and controls: [icons.getbootstrap.com](https://icons.getbootstrap.com/).
- **YouVersion Developer API** — [developers.youversion.com/api/bibles](https://developers.youversion.com/api/bibles), the official Bible text source.
- **Lockman Foundation License** — licensed Bible translations accessed via this app include NASB1995 (ID 100), NASB2020 (ID 2692), AMP (ID 1588), LBLA (ID 89), and NBLA (ID 103).

---

## 1. Overview

A locally-run web application that guides users through Kay Arthur's Precepts Inductive Study Method for any Bible passage. It fetches text from the YouVersion API, uses a local LLM (Ollama) for stage-by-stage guidance, and persists study sessions in a local database.

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Browser (React)                           │
│                                                                     │
│  ┌──────────────┐  ┌─────────────────────────────┐  ┌──────────┐  │
│  │   Session    │  │     Main Study Canvas        │  │  Stage   │  │
│  │   Sidebar    │  │  ┌──────────────────────┐   │  │  Guide   │  │
│  │  (history)   │  │  │  Verse / Passage     │   │  │  Panel   │  │
│  │              │  │  │  (highlightable text)│   │  │  (LLM)   │  │
│  │  - session 1 │  │  └──────────────────────┘   │  │          │  │
│  │  - session 2 │  │  ┌──────────────────────┐   │  │  Stage 1 │  │
│  │  - session 3 │  │  │  Highlight Legend    │   │  │  Stage 2 │  │
│  │  + New Study │  │  │  & Word Annotations  │   │  │  ...     │  │
│  └──────────────┘  │  └──────────────────────┘   │  │  Stage 7 │  │
│                     └─────────────────────────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────────────┘
                             │
               ┌─────────────┴──────────────┐
               ▼                            ▼
     Node.js/Express Backend          Ollama (local LLM)
     ┌───────────────────┐            http://localhost:11434
     │ /api/verse        │ ──proxy──► YouVersion API
     │ /api/llm-guide    │ ──────────► ollama chat API
     │ /api/sessions     │
     └────────┬──────────┘
              │
              ▼
         SQLite DB
     (sessions, highlights,
      annotations, notes)
```

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | React + TypeScript + Vite | Fast POC setup, component model ideal for staged UI |
| Styling | Tailwind CSS | Rapid utility-first styling, dark mode support |
| Backend | Node.js + Express | Lightweight, proxies API + serves LLM requests |
| LLM | Ollama (local) — `deepseek-r1:8b` | Best thinking model at 8B class; 128K context window critical for multi-stage session context; see Section 7 |
| Bible text | YouVersion REST API (`/v1/bibles/{id}/passages/{usfm}`) | Official API per your spec |
| Session storage | SQLite via `better-sqlite3` | File-based, no separate DB server, fully offline |
| Highlighting | Custom React `useSelection` hook | In-browser text range API, no external dependency |

---

## 4. YouVersion API Key Endpoints (Used)

| Endpoint | Purpose |
|---|---|
| `GET /v1/bibles?language_ranges[]=en` | List available translations |
| `GET /v1/bibles/{id}/passages/{USFM}` | **Primary** — fetch verse/passage text |
| `GET /v1/bibles/{id}/books` | Populate book selector |
| `GET /v1/bibles/{id}/index` | Build chapter/verse navigation |

**USFM format**: `JHN.3.16`, `GEN.1.1-3`, `PSA.23`, `ROM.8` (full chapter)  
**Default Bible**: NASB2020 (New American Standard Bible 2020, ID `2692`) — licensed via Lockman Foundation Fast-track license. Canonical Precepts study translation.

> **API key**: Stored in `.env` as `YOUVERSION_API_KEY`. See `.env.example`. Never commit `.env` to source control — add it to `.gitignore` immediately.

### Licensed Translations Available

| Abbreviation | Name | ID |
|---|---|---|
| **NASB2020** *(default)* | New American Standard Bible 2020 | 2692 |
| NASB1995 | New American Standard Bible 1995 | 100 |
| AMP | Amplified Bible | 1588 |
| LBLA | La Biblia de las Américas | 89 |
| NBLA | Nueva Biblia de las Américas | 103 |

The translation is **locked at session creation** and cannot be changed mid-session. This prevents highlight character-offset invalidation. Multi-translation support is in the backlog.

### Passage Size Rules

- **Minimum**: A single verse (e.g., `JHN.3.16`)
- **Maximum**: One full chapter (e.g., `ROM.8` — 39 verses)
- If a user attempts to input a multi-chapter range, the app clips to the first chapter and shows a warning: *"Precepts studies work best on one chapter at a time. Your range has been trimmed to [X]."*
- Very long chapters (e.g., Psalm 119 — 176 verses) are a special case: cap at **50 verses** and prompt the user to split into sections.

---

## 5. The 6-Stage Precepts Study Flow

Each stage is a discrete UI panel. Users can navigate **backward** to any prior stage at any time. When returning to an earlier stage and making changes (e.g., adding highlights), the LLM-generated content in all subsequent stages is **regenerated** to reflect the updated context — prior user-written notes are preserved but AI guidance is refreshed. A banner indicates which stages are stale and awaiting regeneration.

```
Stage 1 ── Prayer, Intent & First Read  [Stages 0+1 merged]
           └─ Passage displayed at full chapter width (up to max cap)
           └─ Optional: User writes an opening prayer or intention note
              (clearly marked as optional — skip button visible)
           └─ User reads the full passage; LLM prompts with orienting
              questions: "What is your first impression? What stands out
              before any interpretation?"
           └─ User jots initial observations in a free-text box

Stage 2 ── Mark Key Words & Themes
           └─ Highlighting tool active. User selects text → assigns a
              Precepts theme color (God, Jesus, H.Spirit, People,
              Sin, Salvation, Location, Time, Key Commands)
           └─ LLM suggests additional words to consider based on
              markup visible so far
           └─ Returning here from a later stage regenerates AI guidance
              in Stages 3-6 based on updated highlights

Stage 3 ── 5 W's & H Interrogation
           └─ Structured form: Who / What / Where / When / Why / How
           └─ LLM pre-populates observations from the passage text and
              the user's highlights; user can edit/add

Stage 4 ── Context & Cross-References
           └─ LLM surfaces relevant cross-reference passages
           └─ User can fetch those passages inline via the same API
           └─ Contrast words (but, therefore, if/then) auto-flagged

Stage 5 ── Interpretation
           └─ LLM synthesizes: context, markings, 5W's, cross-refs
           └─ Asks guiding questions rather than stating conclusions
           └─ User writes their own interpretation in a free-text box

Stage 6 ── Application
           └─ LLM prompts: commands to obey / promises to believe /
              principles to live by
           └─ User writes a personal application statement
           └─ Session is saved & shown in sidebar
```

### Stage Regeneration Behaviour

When a user navigates back and modifies Stage N, all AI-generated content in stages > N is marked **stale** (shown with a subtle amber indicator). The user can either:
- **Regenerate now** — immediately refresh AI guidance for all stale stages
- **Continue reviewing** — AI content regenerates automatically when the user arrives at each stale stage

User-written text in all stages is **always preserved** regardless of regeneration.

---

## 6. Highlighting & Symbol System

- **Selection mechanism**: Browser native `window.getSelection()` API, wrapped in a React hook that stores character offsets within the verse text.
- **Reference**: Symbol design is inspired by the Precepts Scotland key word marking system (see Section 0). The traditional Precepts system uses hand-drawn symbols in physical workbooks; this app approximates them using CSS and Unicode.

### Marking Categories, Colours & Symbols

| Category | Background | Symbol | CSS Approach |
|---|---|---|---|
| God (Father) | Yellow `#FFF176` | △ Triangle above | `::before` with CSS `border` triangle shape |
| Jesus / Messiah | Purple `#CE93D8` | ✝ Cross | Unicode `✝` (U+271D) via `::before` |
| Holy Spirit | Light Blue `#81D4FA` | ☁ Cloud | Unicode `☁` (U+2601) via `::before` |
| People / Israel | Orange `#FFCC80` | ✎ Person/pencil | Unicode `✎` (U+270E) or SVG person outline |
| Sin / Evil | Red `#EF9A9A` | ✗ / worm | Unicode `✗` (U+2717) via `::before` |
| Salvation / Promise | Green `#A5D6A7` | ★ Star | Unicode `★` (U+2605) via `::before` |
| Commands / Instructions | Pink `#F48FB1` | → Arrow | Unicode `→` (U+2192) via `::before` |
| Geographical Location | Grey `#B0BEC5` | 📍 underline | Dotted `border-bottom` in grey |
| Time Phrases | Brown `#BCAAA4` | ⏱ / underline | Dashed `border-bottom` in brown |
| Contrast Words (but/therefore) | Teal `#80CBC4` | ↔ | Unicode `↔` (U+2194) via `::before` |

### CSS Feasibility

This is **entirely feasible** in CSS. Each highlighted `<span>` receives a data attribute (`data-mark="god"`) and Tailwind or custom CSS classes apply both the background colour and the `::before` symbol. Key considerations:

- **Overlapping marks**: A word marked as both a *key word* and a *time phrase* is handled by stacking: primary category sets the background, secondary category adds a second symbol via `::after`. More than two overlapping marks on one word is unusual and can be shown with a multi-colour gradient border.
- **Symbol size**: `::before` symbols are rendered at ~0.6em, superscript-style, so they sit above the word without disrupting line height.
- **Toggle legend**: A floating legend panel shows all active marks for the current passage, and clicking a legend item can highlight/dim that category across the whole text.
- **Complexity**: Low-to-medium effort. The hardest part is the selection-to-span conversion preserving existing overlapping spans, not the CSS itself.

### LLM Integration with Highlights

When the LLM is called from Stage 3 onward, highlights are serialised into the prompt as structured text:

```
The following words/phrases have been marked by the user:
- "God" [God/Father] at v.1
- "eternal life" [Salvation/Promise] at v.16
- "believes" [Commands] at v.16
- "For God so loved" [God/Father, Salvation/Promise] at v.16
```

This gives the LLM full awareness of what the user has noticed and categorised, allowing it to ask targeted follow-up questions grounded in the user's own observations. Yes — **the LLM can and should interpret both text notes and highlight data**. The serialisation approach is simple and reliable.

- **Storage**: Highlights stored as `{passage_id, start_offset, end_offset, category, note, verse_ref}` rows in SQLite. The original fetched passage text is also stored at session creation, so offsets remain valid permanently.
- **Annotations**: Clicking a highlight shows a popover for adding a short note, which also flows into the LLM context.

---

## 7. LLM Strategy

### 7.1 Model Selection

**Recommended: `deepseek-r1:8b`** (`ollama pull deepseek-r1:8b`, 5.2 GB)

This is the best fit for inductive Bible study guidance among locally-runnable 8B models:

| Model | Thinking | Context | RAM | Notes |
|---|---|---|---|---|
| `deepseek-r1:8b` ✅ | Yes (`<think>` tags) | 128K | ~6 GB | Best reasoning, longest context for accumulating stage notes |
| `qwen3:8b` | Yes (toggle) | 40K | ~6 GB | Good reasoning, shorter context — may truncate by Stage 5 |
| `llama3.1:8b` | No | 128K | ~6 GB | Solid instruction following, no explicit reasoning chain |

**Why `deepseek-r1` specifically:**
- Its internal `<think>...</think>` reasoning chain, which the app strips before displaying, allows the model to **verify cross-reference citations** before surfacing them — dramatically reducing hallucinations in Stage 4.
- The 128K context window can hold the full passage + all prior stage notes without summarisation for most studies.
- Latest version (`deepseek-r1:8b`, 0528 release) is Qwen3-8B-based, so it inherits Qwen3's strong multilingual support.

At startup, the backend detects available Ollama models and recommends the best available one, with a note if a preferred model isn't installed.

### 7.2 Prompt Strategy (Non-Biased)

All prompts are engineered to:
1. **Ask questions, not give answers** — the LLM is a Socratic guide
2. **Stay textual** — all observations must reference specific words/phrases in the text
3. **Defer interpretation** to the human until Stage 5
4. **Verify before citing** — in thinking mode, the model reasons through cross-references before outputting them

**Example Stage 3 system prompt:**
```
You are a non-denominational inductive Bible study facilitator following the
Precepts methodology. Your role is to help the user observe what the text
says — not what it might mean. Ask open-ended questions. Do not state
theological conclusions. Reference only the exact words the user has provided
or highlighted. Keep responses concise (3-5 bullet points max).
```

**Bias disclosure**: The model has implicit leanings from its training data (predominantly Protestant English-language biblical commentary). A persistent info tooltip in the UI discloses this: *"This AI assistant uses a general language model. Its suggestions reflect patterns in published Bible commentary and may carry denominational assumptions. Always verify against the text itself."* A future backlog item allows the system prompt to be customised by denominational preference.

### 7.3 Context & Memory Strategy

The core concern is that LLMs have no persistent memory between API calls — every call is stateless. The solution is **structured context injection**: the full study context is reconstructed from SQLite and prepended to every prompt.

**What is injected at each stage call:**

```
[PASSAGE]
NASB2020 — John 3:16-21
"For God so loved the world..."

[USER HIGHLIGHTS]
- "God" → God/Father (yellow, △)
- "eternal life" → Salvation/Promise (green, ★)
- "believes" → Commands (pink, →)

[STAGE 1 NOTES - Prayer & First Read]
"I want to understand what it means to truly believe..."

[STAGE 2 NOTES - Key Words]
"Noticed 'world' appears multiple times. Also marked..."

[STAGE 3 ANSWERS - 5W's]
Who: God, the Son, the world...
...

[CURRENT TASK]
You are now at Stage 4: Context & Cross-References...
```

**Why this works reliably:**
- The context is rebuilt from the database on every call — there is no drift or forgetting.
- With `deepseek-r1`'s 128K context, a full 6-stage study session's worth of notes (~3,000-8,000 tokens) fits easily.
- If a session is exceptionally long (e.g., a full chapter with dense annotations), earlier stage notes are summarised via a brief LLM call before being re-injected, keeping the total under 30K tokens.
- User-written text is **never summarised or truncated** — only AI-generated stage introductions are condensed if needed.

---

## 8. Data Model (SQLite)

```sql
sessions      (id, passage_ref, bible_id, created_at, title, stage_completed)
highlights    (id, session_id, start_offset, end_offset, category, note)
stage_notes   (id, session_id, stage, content, updated_at)
cross_refs    (id, session_id, passage_ref, note)
```

---

## 9. Project Structure

```
precepts-bible-study-app/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar/      # Session history (ChatGPT-style ribbon)
│   │   │   ├── PassageView/  # Highlighted scripture canvas
│   │   │   ├── StageGuide/   # LLM chat panel per stage
│   │   │   ├── Highlighter/  # Text selection + color picker
│   │   │   └── VerseInput/   # Reference picker (book/chapter/verse)
│   │   ├── hooks/
│   │   │   ├── useHighlight.ts
│   │   │   ├── useSession.ts
│   │   │   └── useLLM.ts
│   │   ├── store/            # Zustand or React context state
│   │   └── types/
├── server/                   # Express backend
│   ├── routes/
│   │   ├── bible.ts          # YouVersion API proxy
│   │   ├── llm.ts            # Ollama chat proxy
│   │   └── sessions.ts       # Session CRUD
│   ├── db/
│   │   ├── schema.sql
│   │   └── db.ts             # better-sqlite3 wrapper
│   └── index.ts
├── .env.example              # YOUVERSION_API_KEY=...
└── package.json              # monorepo or two package.jsons
```

---

## 10. Offline POC Setup Requirements

1. **Ollama** installed locally:
   ```bash
   brew install ollama
   ollama pull deepseek-r1:8b
   ```
   M1 16 GB RAM with Metal GPU offloading handles `deepseek-r1:8b` (5.2 GB) well — expect ~1-3s first token latency. The model's internal `<think>` block adds ~2-5s to cross-reference verification in Stage 4 but is stripped before display.
2. **YouVersion API key** — already stored in `.env` as `YOUVERSION_API_KEY`. Internet required for verse fetching; text is cached in SQLite after first fetch for offline reuse.
3. **Node.js 20+** and **npm**
4. Single `npm run dev` command starts both client (Vite on `:5173`) and server (Express on `:3001`) via `concurrently`

---

## 11. Phased Build Order

Each phase ends with a **testing checkpoint** before the next phase begins. Unit tests are written alongside the code being built (not deferred). Integration tests are added as soon as two or more subsystems are connected.

### Testing Stack

| Layer | Tool | Purpose |
|---|---|---|
| Unit tests (server) | **Vitest** | Route handlers, DB helpers, prompt-builder functions |
| Unit tests (client) | **Vitest + React Testing Library** | Hooks (`useHighlight`, `useLLM`, `useSession`), UI components |
| Integration tests | **Vitest + Supertest** | API route end-to-end: verse fetch, session CRUD, LLM proxy |
| E2E tests (Phase 5+) | **Playwright** | Full user flows: create session → highlight → complete stage → verify DB state |
| LLM tests | Manual golden-file assertions | Verify that prompt serialisation is deterministic; LLM responses are not unit-tested |

### Phases

| Phase | Deliverable | Tests Added |
|---|---|---|
| **1** | Backend scaffolding: Express server, YouVersion proxy, SQLite setup | Unit tests for DB schema & migrations; integration test for `/api/verse` proxy (mock YouVersion response); integration test for `/api/sessions` CRUD |
| **2** | Frontend shell: Sidebar, VerseInput, PassageView (static layout) | Unit tests for `VerseInput` validation (USFM parsing, chapter cap logic); component render tests for Sidebar and PassageView |
| **3** | Highlighting engine: selection hook, colour/symbol palette, persistence | Unit tests for `useHighlight` (offset calculation, overlap handling); integration test: highlight → save → reload → verify offsets match |
| **4** | LLM integration: Ollama proxy, per-stage prompt templates | Unit tests for prompt-builder (verify structured context serialisation); integration test for `/api/llm-guide` with mocked Ollama response; test `<think>` tag stripping |
| **5** | Full 6-stage study flow wired end-to-end | Playwright E2E: create session, complete all 6 stages, verify final state in SQLite; test backward navigation + stale-stage regeneration banner |
| **6** | Session persistence & sidebar history | Integration tests for session list, title update, session resume; E2E: close and reopen app, verify session restored correctly |
| **7** | Polish: keyboard shortcuts, dark mode, LLM disposition tooltip, denomination prompt customisation | Smoke tests for keyboard shortcut bindings; visual regression test for dark mode (Playwright screenshot diff) |

---

## 12. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| YouVersion API key gating / rate limits | Cache all fetched passages in SQLite after first retrieval |
| Ollama response latency on lower-end hardware | Stream responses token-by-token (Ollama supports SSE streaming) |
| LLM theological bias | Strict system prompt constraining it to observational questions only |
| Loss of session data | Auto-save on every stage completion; SQLite is a single durable file |

---

## 13. Open Questions & Critical Concerns

### 13.1 Scope & UX

- **Stage navigation** ✅ *Resolved* — Backward navigation is allowed at any time. Returning to an earlier stage and making changes triggers regeneration of AI guidance in all subsequent stages. User-written notes are always preserved.

- **Passage size** ✅ *Resolved* — Supports single verses up to one full chapter (max 50 verses for exceptionally long chapters like Psalm 119). Multi-chapter inputs are clipped with a user-facing warning. Highlighting canvas uses a verse-per-line layout with verse numbers as anchors.

- **Prayer stage** ✅ *Resolved* — Merged with Stage 1 (Read & Observe) into a single opening stage. The prayer/intention box is clearly **optional** with a visible skip affordance, preserving the spiritual framing without creating mandatory friction.

- **Session naming** ✅ *Resolved* — When a session is created, the LLM generates a short suggested title (e.g., *"God's Love and Judgment — John 3:16-21"*) as the default. The user can click the title in the sidebar to rename it, identical to the ChatGPT pattern. The passage reference and date are shown as a subtitle regardless of the user-set title.

- **Mobile layout** — Deferred to backlog. The 3-column desktop layout is the POC target. A responsive collapse strategy (sidebar → hamburger, stage panel → bottom drawer) will be designed later without requiring a full refactor, provided Tailwind responsive classes are used from the start.

### 13.2 LLM & AI Concerns

- **Hallucinated cross-references** ✅ *Resolved* — `deepseek-r1`'s `<think>` chain allows the model to reason through whether a cross-reference is plausible before outputting it. Additionally, all suggested references are validated against the YouVersion API before display — any reference that returns a 404 is silently dropped and a fallback prompt requests an alternative.

- **LLM bias disclosure** ✅ *Resolved* — A persistent info tooltip states: *"This AI assistant uses a general language model and may reflect assumptions from published commentary. Always verify against the text itself."* A backlog item adds a denomination preference setting that modifies the system prompt (e.g., Reformed, Catholic, Pentecostal orientation).

- **Model** ✅ *Resolved* — Using `deepseek-r1:8b` on M1 16 GB. Best-in-class reasoning at 8B, 128K context, strong at verifying cross-references internally. See Section 7.1 for full comparison.

- **Conversation memory** ✅ *Resolved* — Statelessness is solved via structured context injection from SQLite on every call (see Section 7.3). `deepseek-r1`'s 128K context window accommodates a full multi-stage study. LLMs do not "forget" when the app correctly rebuilds context from the database before each call.

### 13.3 Data & Technical

- **YouVersion API key** ✅ *Resolved* — Key provided and stored in `.env`. User is an active API test participant. No fallback needed for POC.

- **Highlight offset fragility** ✅ *Resolved* — Translation is locked at session creation. The original fetched passage text is stored in the `sessions` table alongside the `bible_id`, so highlight character offsets are valid for the lifetime of the session regardless of API changes.

- **No authentication** — *Technical debt, noted.* This is acceptable for a local POC. The architecture (Express + SQLite local file) does not bake in any multi-user assumptions. Authentication (e.g., local passphrase or OS-level access) is a backlog item for if/when the app moves to a hosted environment.

- **Export** — *Deferred to backlog.* Not in scope for POC.

---

## 14. Decisions — Final Status

- [x] YouVersion API key — stored in `.env`
- [x] Stage navigation — free backward navigation with AI regeneration
- [x] Passage input — single verse to full chapter, max 50 verses
- [x] Ollama model — `deepseek-r1:8b` (M1 16 GB, 128K context, thinking mode)
- [x] Prayer stage — merged with Stage 1, optional
- [x] Session naming — LLM auto-suggests title, user-editable (ChatGPT pattern)
- [x] Translation — locked to NASB2020 at session creation; multi-translation in backlog
- [x] LLM bias — disclosed via persistent tooltip; denomination prompt in backlog
- [x] Conversation memory — context injection from SQLite; no true memory needed
- [x] Authentication — not in scope for POC; noted as technical debt
- [x] Export — deferred to backlog
- [x] Mobile layout — deferred to backlog; Tailwind responsive classes used from start to avoid refactor
- [x] Stage panel UI (right-hand side) — right-hand Stage Guide panel retained in the layout; design can be iterated after POC use

---

## 15. Backlog (Post-POC)

These items are out of scope for the initial build but should be tracked:

| Item | Notes |
|---|---|
| Mobile / responsive layout | Sidebar → hamburger, stage panel → bottom drawer. Use Tailwind breakpoints from day 1 to ease this |
| Stage Guide panel redesign | Retained for POC. After use, consider inline LLM guidance within each stage rather than a persistent right-hand panel |
| Multi-translation support | Allow translation switching between sessions; add a comparison view for same passage in multiple translations |
| Denomination preference / custom system prompt | Let user set a denominational lens (Reformed, Catholic, Charismatic, etc.) that modifies the LLM system prompt |
| Export study as PDF | Requires headless renderer (Puppeteer) to preserve highlight colours. Scope after POC |
| Authentication | Local passphrase or OS-level protection for the SQLite file if deployed beyond localhost |
| Study sharing | Export a session as a shareable JSON bundle that another user can import |
| Group study mode | Multiple users annotating the same passage; requires proper auth and a shared DB |
| Additional Bible translations | Expand beyond Lockman license to include ESV, NIV, KJV depending on licensing |
