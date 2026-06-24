---
name: Drizzle numeric/decimal columns return strings
description: Drizzle ORM returns numeric and decimal Postgres columns as JavaScript strings, not numbers. Must coerce before passing through Zod schemas.
---

## Rule
Create a `parseNum` helper and apply it to all numeric/decimal fields before Zod `.parse()`.

```typescript
// artifacts/api-server/src/lib/coerce.ts
export function parseNum(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
```

**Why:** The generated Zod schemas from Orval use `z.number()` which rejects string values. Drizzle returns `price: "38.99"` (string) not `price: 38.99` (number). Passing raw DB rows directly to `ZodSchema.parse()` causes Zod validation errors.

**How to apply:** In every route handler that returns numeric fields (`price`, `cost`, `balance`, `total`, `subtotal`, `tax`, `discountAmt`, `discountPct`, `lineTotal`, `totalPurchases`), wrap the row in a mapper function that applies `parseNum()` before the Zod parse call. Also: when inserting/updating, convert back to string for Drizzle (`String(parsed.data.price)`).
