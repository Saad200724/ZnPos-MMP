export function parseNum(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
