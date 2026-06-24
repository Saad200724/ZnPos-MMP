---
name: Monorepo flat structure
description: Workspace restructured to flat client/server/shared layout using single root npm package.json (no pnpm workspace).
---

## Package manager
- **npm** (not pnpm). Single root `package.json`. No pnpm-workspace.yaml.
- Install: `npm install --legacy-peer-deps` (esbuild-plugin-pino has strict peer dep on esbuild <= 0.25.8 but we use 0.27.3)

## Directory layout
```
client/src/          @workspace/client frontend (React + Vite)
  lib/api/           api-client-react inlined here
server/              Express backend + DB inline
  db/                Drizzle schema (was lib/db)
  routes/            individual route files
  routes.ts          route aggregator
  index.ts           server entry
  scripts/seed.ts    seed script
shared/src/          Zod/Orval types (was lib/api-zod)
attached_assets/     static assets
artifacts/           only .replit-artifact/artifact.toml shells remain (no source)
lib/api-spec/        OpenAPI spec + orval config (not a workspace package)
```

## npm scripts (root package.json)
- `dev:server` — `tsx server/index.ts`
- `dev:client` — `vite --config client/vite.config.ts --host 0.0.0.0`
- `build` — `vite build --config client/vite.config.ts`
- `build:server` — `node server/build.mjs`
- `db:push` — `drizzle-kit push --config server/drizzle.config.ts`
- `db:seed` — `tsx server/scripts/seed.ts`

## Replit workflows (artifact.toml)
- API Server: `npm run dev:server` (port 8080)
- Mew Mew POS: `npm run dev:client` (port 22138)

## Import conventions
- Server routes import shared types as `../../shared/src` (relative, no workspace alias)
- Client imports API client as `@/lib/api` (Vite alias → client/src/lib/api/)
- Server DB imported relatively: `../db` from routes, `./db` from server root

**Why:** User wanted flat structure with npm instead of pnpm workspace.

**How to apply:** New server routes go in `server/routes/`, register in `server/routes.ts`, import from `../../shared/src` for types, `../db` for database.
