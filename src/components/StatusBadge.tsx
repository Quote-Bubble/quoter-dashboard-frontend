import type { AccessScore, LeadStatus } from "@/lib/types";
import {
  accessColor,
  accessLabel,
  statusColor,
  statusLabel,
} from "@/lib/format";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { fg, bg } = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: fg, backgroundColor: bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: fg }}
      />
      {statusLabel(status)}
    </span>
  );
}

export function AccessBadge({ score }: { score: AccessScore }) {
  const { fg, bg } = accessColor(score);
  return (
    <span
      className="badge-tactile inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: fg, backgroundColor: bg }}
    >
      {accessLabel(score)}
    </span>
  );
}
