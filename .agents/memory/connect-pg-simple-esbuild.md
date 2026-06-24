---
name: connect-pg-simple esbuild externalize
description: connect-pg-simple must be externalized in esbuild config or session storage silently fails with ENOENT on table.sql
---

## Rule
Add `"connect-pg-simple"` to the `external` array in `artifacts/api-server/build.mjs`.

**Why:** connect-pg-simple reads `table.sql` from its own package directory using `__dirname`. When bundled by esbuild, `__dirname` resolves to `dist/` (the bundle output) rather than the package directory, causing `ENOENT: no such file or directory, open '.../dist/table.sql'`. This error is non-fatal but silently prevents the session store from initializing — login appears to succeed (returns user JSON) but subsequent authenticated requests all get 401 because no session is ever persisted.

**How to apply:** Any time `connect-pg-simple` is added to an Express app that uses esbuild bundling, immediately add it to the `external` list in `build.mjs`.
