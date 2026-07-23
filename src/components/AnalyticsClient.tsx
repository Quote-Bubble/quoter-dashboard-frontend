"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import LineChart, { type LinePoint } from "@/components/charts/LineChart";
import {
  formatMoney,
  jobTypeLabel,
  statusColor,
  statusLabel,
  STATUS_ORDER,
} from "@/lib/format";
import type { JobType, LeadStatus } from "@/lib/types";
import {
  buildDailyBuckets,
  dayKey,
  median,
  summariseDay,
  todayKey,
  yesterdayKey,
  type QuoteStat,
} from "@/lib/analytics";

const RANGE_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
] as const;

type StatusOrAll = "all" | LeadStatus;

const STATUS_FILTERS: { key: StatusOrAll; label: string }[] = [
  { key: "all", label: "All" },
  ...STATUS_ORDER.map((s) => ({ key: s, label: statusLabel(s) })),
];

function compactMoney(v: number): string {
  if (v >= 10_000) return `£${Math.round(v / 1000)}K`;
  if (v >= 1_000) return `£${(v / 1000).toFixed(1)}K`;
  return formatMoney(v);
}

function formatCount(v: number): string {
  return String(Math.round(v));
}

function formatPercent(v: number): string {
  return `${Math.round(v)}%`;
}

function StatCard({
  title,
  value,
  deltaLabel,
  data,
  formatValue,
}: {
  title: string;
  value: string;
  deltaLabel: string;
  data: LinePoint[];
  formatValue: (v: number) => string;
}) {
  return (
    <div className="surface rounded-2xl p-4">
      <p className="text-xs font-medium text-ink-soft">{title}</p>
      <p className="mt-0.5 text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{deltaLabel}</p>
      <div className="mt-3">
        <LineChart data={data} formatValue={formatValue} height={90} />
      </div>
    </div>
  );
}

/** A labelled row with a proportional bar — shared shape for the job-type and
 *  won-vs-lost breakdowns, so both compare magnitudes at a glance without
 *  needing a full chart each. */
function BarRow({
  label,
  count,
  value,
  pct,
  color,
}: {
  label: string;
  count: number;
  value: number | null;
  pct: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-ink-soft">
          {color && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
          {label}
          <span className="text-muted">({count})</span>
        </span>
        <span className="font-medium tabular-nums text-ink">
          {value != null ? formatMoney(value) : "—"}
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-black/[0.05]">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color ?? "var(--color-brand-500)" }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsClient({ stats }: { stats: QuoteStat[] }) {
  const [rangeDays, setRangeDays] =
    useState<(typeof RANGE_OPTIONS)[number]["days"]>(7);
  const [statusFilter, setStatusFilter] = useState<StatusOrAll>("all");

  const today = todayKey();
  const yesterday = yesterdayKey();
  const todaySummary = useMemo(() => summariseDay(stats, today), [stats, today]);
  const yesterdaySummary = useMemo(
    () => summariseDay(stats, yesterday),
    [stats, yesterday],
  );

  // Unfiltered window — drives Win rate, Value by job type and Won vs Lost,
  // which are fixed insights regardless of what the picker below is set to.
  const buckets = useMemo(
    () => buildDailyBuckets(stats, rangeDays),
    [stats, rangeDays],
  );
  const prevBuckets = useMemo(
    () => buildDailyBuckets(stats, rangeDays, rangeDays),
    [stats, rangeDays],
  );
  const windowStats = useMemo(() => {
    const keys = new Set(buckets.map((b) => b.key));
    return stats.filter((s) => keys.has(dayKey(s.receivedAt)));
  }, [stats, buckets]);

  // Win rate: won / (won + lost), per day and overall.
  const winRatePoints: LinePoint[] = useMemo(
    () =>
      buckets.map((b) => {
        const dayStats = windowStats.filter((s) => dayKey(s.receivedAt) === b.key);
        const wonCount = dayStats.filter((s) => s.status === "won").length;
        const lostCount = dayStats.filter((s) => s.status === "lost").length;
        const total = wonCount + lostCount;
        return { label: b.label, value: total > 0 ? (wonCount / total) * 100 : 0 };
      }),
    [buckets, windowStats],
  );
  const wonCount = windowStats.filter((s) => s.status === "won").length;
  const lostCount = windowStats.filter((s) => s.status === "lost").length;
  const winRate =
    wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : null;
  const prevWindowStats = useMemo(() => {
    const keys = new Set(prevBuckets.map((b) => b.key));
    return stats.filter((s) => keys.has(dayKey(s.receivedAt)));
  }, [stats, prevBuckets]);
  const prevWonCount = prevWindowStats.filter((s) => s.status === "won").length;
  const prevLostCount = prevWindowStats.filter((s) => s.status === "lost").length;
  const prevWinRate =
    prevWonCount + prevLostCount > 0
      ? (prevWonCount / (prevWonCount + prevLostCount)) * 100
      : null;

  // Value by job type: median estimate per job type, within the window.
  const jobTypeRows = useMemo(() => {
    const groups = new Map<JobType, number[]>();
    for (const s of windowStats) {
      if (s.value == null) continue;
      const arr = groups.get(s.jobType) ?? [];
      arr.push(s.value);
      groups.set(s.jobType, arr);
    }
    return Array.from(groups.entries())
      .map(([jobType, values]) => ({
        jobType,
        count: values.length,
        median: median(values) ?? 0,
      }))
      .sort((a, b) => b.median - a.median)
      .slice(0, 5);
  }, [windowStats]);
  const maxJobTypeMedian = Math.max(1, ...jobTypeRows.map((r) => r.median));

  // Won vs Lost: median value of leads that ended in each outcome.
  const wonValues = windowStats
    .filter((s) => s.status === "won" && s.value != null)
    .map((s) => s.value as number);
  const lostValues = windowStats
    .filter((s) => s.status === "lost" && s.value != null)
    .map((s) => s.value as number);
  const wonMedian = median(wonValues);
  const lostMedian = median(lostValues);
  const maxOutcomeMedian = Math.max(1, wonMedian ?? 0, lostMedian ?? 0);

  // Filtered by the status picker — drives the two trend cards.
  const filteredStats = useMemo(
    () =>
      statusFilter === "all"
        ? stats
        : stats.filter((s) => s.status === statusFilter),
    [stats, statusFilter],
  );
  const filteredBuckets = useMemo(
    () => buildDailyBuckets(filteredStats, rangeDays),
    [filteredStats, rangeDays],
  );
  const filteredPrevBuckets = useMemo(
    () => buildDailyBuckets(filteredStats, rangeDays, rangeDays),
    [filteredStats, rangeDays],
  );
  const filteredWindowValues = useMemo(() => {
    const keys = new Set(filteredBuckets.map((b) => b.key));
    return filteredStats
      .filter((s) => s.value != null && keys.has(dayKey(s.receivedAt)))
      .map((s) => s.value as number);
  }, [filteredStats, filteredBuckets]);
  const filteredPrevWindowValues = useMemo(() => {
    const keys = new Set(filteredPrevBuckets.map((b) => b.key));
    return filteredStats
      .filter((s) => s.value != null && keys.has(dayKey(s.receivedAt)))
      .map((s) => s.value as number);
  }, [filteredStats, filteredPrevBuckets]);

  const totalCount = filteredBuckets.reduce((sum, b) => sum + b.count, 0);
  const prevTotalCount = filteredPrevBuckets.reduce((sum, b) => sum + b.count, 0);
  const medianValue = median(filteredWindowValues);
  const prevMedianValue = median(filteredPrevWindowValues);

  const filterLabel = STATUS_FILTERS.find((f) => f.key === statusFilter)!.label;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Quote volume and estimated value across your pipeline."
      />

      {/* Today */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs font-medium text-ink-soft">Quotes today</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">
            {todaySummary.count}
          </p>
          <p className="text-xs text-muted">{yesterdaySummary.count} yesterday</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs font-medium text-ink-soft">Median estimate today</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">
            {todaySummary.median != null ? formatMoney(todaySummary.median) : "—"}
          </p>
          <p className="text-xs text-muted">
            {yesterdaySummary.median != null
              ? formatMoney(yesterdaySummary.median)
              : "—"}{" "}
            yesterday
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">
          Your overview
        </h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          Date range
          <select
            value={rangeDays}
            onChange={(e) =>
              setRangeDays(
                Number(e.target.value) as (typeof RANGE_OPTIONS)[number]["days"],
              )
            }
            className="field rounded-lg px-2.5 py-1 text-sm font-medium text-ink outline-none"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.days} value={o.days}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Status picker — scopes the two trend cards below to a single
          status, so "how many did I win/lose" reads as a trend. */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-black/[0.04]",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title={
            statusFilter === "all" ? "Quotes received" : `${filterLabel} quotes`
          }
          value={formatCount(totalCount)}
          deltaLabel={`${prevTotalCount} previous period`}
          data={filteredBuckets.map((b) => ({ label: b.label, value: b.count }))}
          formatValue={formatCount}
        />
        <StatCard
          title={
            statusFilter === "all"
              ? "Median quote value"
              : `${filterLabel} median value`
          }
          value={medianValue != null ? formatMoney(medianValue) : "—"}
          deltaLabel={
            prevMedianValue != null
              ? `${formatMoney(prevMedianValue)} previous period`
              : "No quotes previous period"
          }
          data={filteredBuckets.map((b) => ({
            label: b.label,
            value: median(b.values) ?? 0,
          }))}
          formatValue={compactMoney}
        />
        <StatCard
          title="Win rate"
          value={winRate != null ? formatPercent(winRate) : "—"}
          deltaLabel={
            prevWinRate != null
              ? `${formatPercent(prevWinRate)} previous period`
              : "No won/lost previous period"
          }
          data={winRatePoints}
          formatValue={formatPercent}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs font-medium text-ink-soft">Value by job type</p>
          <p className="text-xs text-muted">Median estimate, this range</p>
          <div className="mt-3 space-y-2.5">
            {jobTypeRows.length === 0 ? (
              <p className="text-sm text-muted">No quotes in this range.</p>
            ) : (
              jobTypeRows.map((row) => (
                <BarRow
                  key={row.jobType}
                  label={jobTypeLabel(row.jobType)}
                  count={row.count}
                  value={row.median}
                  pct={(row.median / maxJobTypeMedian) * 100}
                />
              ))
            )}
          </div>
        </div>

        <div className="surface rounded-2xl p-4">
          <p className="text-xs font-medium text-ink-soft">Won vs. lost value</p>
          <p className="text-xs text-muted">Median estimate, this range</p>
          <div className="mt-3 space-y-2.5">
            <BarRow
              label={statusLabel("won")}
              count={wonValues.length}
              value={wonMedian}
              pct={((wonMedian ?? 0) / maxOutcomeMedian) * 100}
              color={statusColor("won").fg}
            />
            <BarRow
              label={statusLabel("lost")}
              count={lostValues.length}
              value={lostMedian}
              pct={((lostMedian ?? 0) / maxOutcomeMedian) * 100}
              color={statusColor("lost").fg}
            />
          </div>
        </div>
      </div>
    </>
  );
}
