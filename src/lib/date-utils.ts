/**
 * Deterministic Date & Time Formatting Utilities for Next.js SSR / Hydration Consistency.
 * Uses explicit 'en-GB' locale and 'UTC' timezone to guarantee identical output
 * on Node.js server render and client browser hydration across all user locales.
 */

const UTC_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const UTC_DATETIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const UTC_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/**
 * Safely parses any date input (timestamp, ISO string, Date object)
 * into a valid Date or null if invalid/missing.
 */
export function parseSafeDate(input: string | number | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === "") {
    return null;
  }
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

/**
 * Deterministically formats a date as DD/MM/YYYY in UTC.
 * Identical on server and client.
 */
export function formatDeterministicDate(
  input: string | number | Date | null | undefined,
  fallback = "N/A"
): string {
  const date = parseSafeDate(input);
  if (!date) return fallback;
  try {
    return UTC_DATE_FORMATTER.format(date);
  } catch {
    return fallback;
  }
}

/**
 * Deterministically formats time as HH:MM in UTC (24-hour).
 */
export function formatDeterministicTime(
  input: string | number | Date | null | undefined,
  fallback = "N/A"
): string {
  const date = parseSafeDate(input);
  if (!date) return fallback;
  try {
    return UTC_TIME_FORMATTER.format(date);
  } catch {
    return fallback;
  }
}

/**
 * Deterministically formats date and time as DD/MM/YYYY, HH:MM:SS in UTC.
 */
export function formatDeterministicDateTime(
  input: string | number | Date | null | undefined,
  fallback = "N/A"
): string {
  const date = parseSafeDate(input);
  if (!date) return fallback;
  try {
    return UTC_DATETIME_FORMATTER.format(date);
  } catch {
    return fallback;
  }
}
