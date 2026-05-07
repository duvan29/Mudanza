## Project: Mudanza App

Private savings tracker for Duvan & Kata — October 2026 apartment move.

### Architecture
- Monorepo: `apps/api` (Fastify), `apps/mobile` (Expo), `packages/types` (shared TS)
- MongoDB Atlas + Railway for API hosting
- Expo Go on iOS for mobile

### Key Rules
- All money as COP integers. Format only in mobile UI via `formatCOP()`.
- Only 2 users: Duvan & Kata. No registration flow.
- `fondo.ahorrado` is denormalized — updated via Movimiento post-save hook.
- `elegida` exclusivity on VersionProducto via pre-save hook.
- API returns `{ data: T }` on success, `{ error, code }` on failure.
- Timeline: January–October 2026 (10 months).

### Commands
```
pnpm dev          # Run API + mobile
pnpm seed         # Seed DB with users, funds, roadmap
pnpm dev:api      # API only
pnpm dev:mobile   # Mobile only
```

### Colors (pastel, soft)
- Primary: #7EB8D4 | Success: #B5EAD7 | Secondary: #C3AED6 | Accent: #FFD6A5
- Fund colors: Muebles=#A8D8EA, Emergencia=#B5EAD7, Arriendo=#E2C2FF, Colchon=#FFD6A5
