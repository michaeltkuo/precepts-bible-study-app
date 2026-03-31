# Client Workspace

React + TypeScript + Vite frontend for the Precepts Bible Study App.

## Commands

```bash
# Start client only (proxying API to localhost:3001)
npm run dev --workspace client

# Unit tests
npm run test --workspace client

# Production build
npm run build --workspace client
```

## Notes

- API calls are proxied via `client/vite.config.ts` to `http://localhost:3001` during local development.
- End-to-end tests are configured at the repo root in `playwright.config.ts`.
- For full project setup, environment variables, and architecture, use the root docs:
  - `README.md`
  - `RUNBOOK.md`
