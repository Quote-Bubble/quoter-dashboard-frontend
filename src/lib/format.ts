import type { AccessScore, JobType, LeadStatus } from "@/lib/types";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** "£8,200 – £11,400" or "—" when no quote (e.g. consultation leads). */
export function formatQuoteRange(
  min: number | null,
  max: number | null,
): string {
  if (min == null || max == null) return "—";
  if (min === max) return gbp.format(min);
  return `${gbp.format(min)} – ${gbp.format(max)}`;
}

export function formatMoney(value: number): string {
  return gbp.format(value);
}

/** Compact relative time: "1h ago", "3d ago". */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

/** Full date for the detail panel. Timezone is pinned to Europe/London so the
 *  server (often UTC) and the client render byte-identical strings — otherwise
 *  React hydration mismatches on the formatted wall-clock time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

const JOB_LABELS: Record<JobType, string> = {
  full_replacement: "Full replacement",
  tile_or_slate_repair: "Tile / slate repair",
  flat_roof_replacement: "Flat roof replacement",
  leak_investigation: "Leak investigation",
  gutters_fascias_soffits: "Gutters, fascias & soffits",
  other: "Other",
};

export function jobTypeLabel(job: JobType): string {
  return JOB_LABELS[job] ?? "Other";
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

export function statusLabel(status: LeadStatus): string {
  return STATUS_LABELS[status];
}

export const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "won", "lost"];

/** Tailwind-ish inline style values keyed by status (kept as raw CSS for the badge). */
export function statusColor(status: LeadStatus): { fg: string; bg: string } {
  switch (status) {
    case "new":
      return { fg: "#1546c9", bg: "#eef4ff" };
    case "contacted":
      return { fg: "#6d28d9", bg: "#f3e8ff" };
    case "won":
      return { fg: "#0d6b3c", bg: "#e6f6ee" };
    case "lost":
      return { fg: "#c02626", bg: "#fdeaea" };
  }
}

const ACCESS_LABELS: Record<AccessScore, string> = {
  easy: "Easy",
  moderate: "Moderate",
  difficult: "Difficult",
};

export function accessLabel(score: AccessScore): string {
  return ACCESS_LABELS[score];
}

export function accessColor(score: AccessScore): { fg: string; bg: string } {
  switch (score) {
    case "easy":
      return { fg: "#0d6b3c", bg: "#e6f6ee" };
    case "moderate":
      return { fg: "#8a5a12", bg: "#fdf3e2" };
    case "difficult":
      return { fg: "#b02a2a", bg: "#fbeaea" };
  }
}

export function formatDistance(miles: number | null): string {
  if (miles == null) return "—";
  return `${miles.toFixed(1)} mi`;
}

/** Build a wa.me link from a UK phone number (07… → +447…). */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `44${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
