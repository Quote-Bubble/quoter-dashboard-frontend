"use client";

import { useMemo, useRef, useState } from "react";

import type { DashboardLead, LeadStatus } from "@/lib/types";
import { jobTypeLabel, statusLabel, STATUS_ORDER } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/PageHeader";
import FilterBar, { type Filter } from "@/components/FilterBar";
import QuotesTable, {
  type SortDir,
  type SortKey,
} from "@/components/QuotesTable";

type StatusFilter = "all" | LeadStatus | "archived";

/** Pill colours per filter: `ink` idle text, `solid` bubble colour. */
const FILTER_COLORS: Record<StatusFilter, { ink: string; solid: string }> = {
  all: { ink: "#3d4148", solid: "#0a0b0d" },
  new: { ink: "#1546c9", solid: "#2f6bff" },
  contacted: { ink: "#6d28d9", solid: "#7c3aed" },
  won: { ink: "#0d6b3c", solid: "#12915a" },
  lost: { ink: "#c02626", solid: "#dc2626" },
  archived: { ink: "#9a6510", solid: "#d99a17" },
};

function compare(a: DashboardLead, b: DashboardLead, key: SortKey): number {
  switch (key) {
    case "contactName":
      return a.contactName.localeCompare(b.contactName);
    case "jobType":
      return jobTypeLabel(a.jobType).localeCompare(jobTypeLabel(b.jobType));
    case "quote":
      return (a.quoteMaxExVat ?? 0) - (b.quoteMaxExVat ?? 0);
    case "distanceMiles":
      return (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity);
    case "status":
      return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    case "receivedAt":
      return (
        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
      );
  }
}

export default function QuotesClient({
  initialLeads,
}: {
  initialLeads: DashboardLead[];
}) {
  const [leads, setLeads] = useState<DashboardLead[]>(initialLeads);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("receivedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flashWonId, setFlashWonId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: 0,
      new: 0,
      contacted: 0,
      won: 0,
      lost: 0,
      archived: 0,
    };
    for (const l of leads) {
      if (l.archived) c.archived += 1;
      else {
        c.all += 1;
        c[l.status] += 1;
      }
    }
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const archivedView = statusFilter === "archived";
    const filtered = leads.filter((l) => {
      if (archivedView ? !l.archived : l.archived) return false;
      if (statusFilter !== "all" && !archivedView && l.status !== statusFilter)
        return false;
      if (!q) return true;
      return (
        l.contactName.toLowerCase().includes(q) ||
        l.addressPostcode.toLowerCase().includes(q) ||
        l.addressFormatted.toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [leads, statusFilter, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "contactName" || key === "jobType" ? "asc" : "desc");
    }
  };

  const handleStatusChange = (id: string, status: LeadStatus) => {
    const prevStatus = leads.find((l) => l.id === id)?.status;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (status === "won") {
      setFlashWonId(id);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlashWonId(null), 650);
    }
    // Persist (RLS allows authenticated members to update lead status).
    void createClient()
      .from("leads")
      .update({ status })
      .eq("id", id)
      .then(({ error }) => {
        if (error && prevStatus) {
          // Roll back on failure.
          setLeads((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status: prevStatus } : l)),
          );
        }
      });
  };

  // Archive is session-only: the leads table has no archived column yet.
  const handleArchive = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, archived: !l.archived } : l)),
    );
    setExpandedId((cur) => (cur === id ? null : cur));
  };

  const handleToggle = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const order: StatusFilter[] = ["all", ...STATUS_ORDER, "archived"];
  const filterLabel = (f: StatusFilter) =>
    f === "all" ? "All" : f === "archived" ? "Archived" : statusLabel(f);
  const archiveIcon = (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-label="Archived">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
    </svg>
  );
  const filterItems: Filter[] = order.map((f) => ({
    key: f,
    label: filterLabel(f),
    count: counts[f],
    ink: FILTER_COLORS[f].ink,
    solid: FILTER_COLORS[f].solid,
    icon: f === "archived" ? archiveIcon : undefined,
  }));

  return (
    <>
      <PageHeader title="Quotes" />

      <div className="toolbar mb-5 flex flex-col gap-3 rounded-2xl p-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar
          filters={filterItems}
          activeKey={statusFilter}
          onSelect={(k) => setStatusFilter(k as StatusFilter)}
        />

        <label className="search-box field flex items-center gap-2 px-3 py-2 sm:w-64">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-muted" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or postcode"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <QuotesTable
        key={statusFilter}
        leads={visible}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onToggle={handleToggle}
        expandedId={expandedId}
        onStatusChange={handleStatusChange}
        onArchive={handleArchive}
        archivedView={statusFilter === "archived"}
        flashWonId={flashWonId}
        newId={null}
      />
    </>
  );
}
