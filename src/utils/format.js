// ---------------------------------------------------------------------------
// FlashVolt — formatting helpers
// ---------------------------------------------------------------------------

const inr = (n, min = 0, max = 0) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: min, maximumFractionDigits: max });

/** Whole-rupee amount → "₹1,260". */
export const formatINR = (n) => `₹${inr(Math.round(n))}`;

/** Decimal amount → "₹1,260.50" (2dp). */
export const formatINR2 = (n) => `₹${inr(n, 2, 2)}`;

/** Generic number, trimmed decimals. */
export const formatNum = (n, max = 1) => inr(Number(n), 0, max);

/** Cost per km → "₹1.64 / km". */
export const formatPerKm = (n) => `₹${inr(n, 2, 2)}/km`;

/** kWh energy with one decimal → "36.0 kWh". */
export const formatKwh = (n, max = 1) => `${inr(Number(n), 0, max)} kWh`;

/** Litres with one decimal → "33.3 L". */
export const formatLitres = (n) => `${inr(Number(n), 0, 1)} L`;

/** Duration in hours → "1h 24m" / "42m". */
export function formatDuration(hours) {
  if (!Number.isFinite(hours)) return '—';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Short duration → "2h 48m" / "1h 24m". */
export function formatDurationShort(hours) {
  if (!Number.isFinite(hours)) return "—";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Readable duration → sub-hour as "45 min", hour+ as "1h 45m". */
export function formatDurationReadable(hours) {
  if (!Number.isFinite(hours)) return "—";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h}h ${m}m`;
}

/** Percentage, rounded to whole number. */
export const formatPct = (n) => `${Math.round(n)}%`;

/** Clamp a number into a safe range (guards against NaN/Infinity). */
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Safe number coercion from a raw input string. */
export function toNumber(raw) {
  if (typeof raw === 'number') return raw;
  const n = parseFloat(String(raw).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}