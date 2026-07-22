import type { LeadStatus } from "@/lib/types";
import { statusColor, statusLabel } from "@/lib/format";

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
