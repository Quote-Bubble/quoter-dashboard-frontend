/**
 * Pure aggregation helpers for the Analytics page. Everything here works over
 * plain { receivedAt, value, status } tuples so it has no dependency on how
 * the data was fetched — the page fetches once, these just bucket/summarise it.
 */

import type { JobType, LeadStatus } from "@/lib/types";

export type QuoteStat = {
  receivedAt: string; // ISO timestamp
  value: number | null; // quote midpoint ex-VAT, or null (e.g. consultation leads)
  status: LeadStatus;
  jobType: JobType;
};

/** Midpoint of a quote range, or null when either bound is missing. */
export function quoteValue(min: number | null, max: number | null): number | null {
  if (min == null || max == null) return null;
  return (min + max) / 2;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Pin to Europe/London so "today" and day-bucket boundaries match the rest of
// the dashboard regardless of server timezone.
const DAY_KEY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  month: "short",
  day: "numeric",
});

/** Calendar-day key ("2026-07-23") in the roofer's timezone. */
export function dayKey(iso: string): string {
  return DAY_KEY_FORMAT.format(new Date(iso));
}

export type DailyBucket = {
  key: string;
  label: string;
  count: number;
  total: number;
  values: number[];
};

/** One bucket per day for a `days`-long window ending `endOffsetDays` days
 *  ago (0 = ending today). Pass `endOffsetDays = days` to get the same-length
 *  window immediately preceding the current one, for period comparisons.
 *  Buckets always exist for the full range even on days with zero quotes. */
export function buildDailyBuckets(
  stats: QuoteStat[],
  days: number,
  endOffsetDays = 0,
): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  const order: string[] = [];
  const end = new Date();
  end.setDate(end.getDate() - endOffsetDays);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.toISOString());
    order.push(key);
    buckets.set(key, {
      key,
      label: DAY_LABEL_FORMAT.format(d),
      count: 0,
      total: 0,
      values: [],
    });
  }
  for (const s of stats) {
    const bucket = buckets.get(dayKey(s.receivedAt));
    if (!bucket) continue; // outside the window
    bucket.count += 1;
    if (s.value != null) {
      bucket.total += s.value;
      bucket.values.push(s.value);
    }
  }
  return order.map((k) => buckets.get(k)!);
}

/** Sum + count + median for every stat matching a calendar-day key. */
export function summariseDay(stats: QuoteStat[], key: string) {
  const values: number[] = [];
  let count = 0;
  for (const s of stats) {
    if (dayKey(s.receivedAt) !== key) continue;
    count += 1;
    if (s.value != null) values.push(s.value);
  }
  return {
    count,
    total: values.reduce((sum, v) => sum + v, 0),
    median: median(values),
  };
}

export function todayKey(): string {
  return dayKey(new Date().toISOString());
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d.toISOString());
}
