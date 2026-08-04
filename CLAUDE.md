## Project: Mudanza App

Private savings tracker for Duvan & Kata — January 15, 2027 apartment move.

### Architecture
- Monorepo: `apps/web` (Next.js 15, App Router — UI + API routes in one app), `packages/types` (shared TS)
- MongoDB Atlas, Mongoose used directly from Next.js (no separate backend). Deploys to Vercel.

### Key Rules
- All money as COP integers. Format only in the UI via `formatCOP()`.
- Only 2 users: Duvan & Kata. No registration flow.
- `Fund.saved` is denormalized — updated via `Movement` post-save hook (`recalcFund`).
- `chosen` exclusivity on `ProductVersion` via pre-save hook.
- API returns `{ data: T }` on success, `{ error, code }` on failure.
- Timeline: January 2026 – January 15, 2027 (~12.5 months). See `TIMELINE`/`TOTAL_TARGET` in `packages/types/src/constants.ts`.

### Commands
```
pnpm dev                # Run the web app
pnpm seed               # Seed DB with users, funds, roadmap (create-if-missing, safe on an empty DB)
```

### Colors (pastel, soft)
- Primary: #7EB8D4 | Success: #B5EAD7 | Secondary: #C3AED6 | Accent: #FFD6A5
- Fund colors: Muebles=#A8D8EA, Emergencia=#B5EAD7, Arriendo=#E2C2FF, Colchon=#FFD6A5
