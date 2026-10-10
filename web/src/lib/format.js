// Number formatting for visible text (en-US thousands separator, integers only).
const INT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function fmtInt(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return 'n/a';
  return INT.format(Math.round(Number(n)));
}

export function fmtSeconds(s) {
  return fmtInt(s);
}
