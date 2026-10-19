/**
 * Europe/Moscow is UTC+3 year-round (no daylight saving time since 2014).
 * We use this fixed offset to convert between Moscow wall-clock and UTC.
 */
export const MOSCOW_OFFSET_HOURS = 3;

/**
 * Returns a Date whose UTC fields represent the Moscow wall-clock time of
 * `date`. Useful for reading Moscow hours/minutes via the `getUTC*` methods.
 */
export function toMoscow(date: Date): Date {
  return new Date(date.getTime() + MOSCOW_OFFSET_HOURS * 60 * 60 * 1000);
}

/** Formats a Date as Moscow wall-clock time, e.g. "09:30". */
export function formatMoscowTime(date: Date): string {
  const moscow = toMoscow(date);
  const hh = String(moscow.getUTCHours()).padStart(2, '0');
  const mm = String(moscow.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Formats a Date as a Moscow wall-clock date, e.g. "19.10". */
export function formatMoscowDate(date: Date): string {
  const moscow = toMoscow(date);
  const dd = String(moscow.getUTCDate()).padStart(2, '0');
  const mm = String(moscow.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}
