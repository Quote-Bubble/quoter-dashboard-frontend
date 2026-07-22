/**
 * Dashboard-facing types.
 *
 * The persisted lead fields mirror the `leads` table (see
 * quoter-backend/lib/leads.ts). `accessScore` and `distanceMiles` are NOT
 * persisted today (access is computed in the widget and never stored;
 * distance-from-home isn't computed anywhere) — they exist here as mock-only
 * fields so the UI can show them. Wiring them for real is future backend work.
 */

export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type JobType =
  | "full_replacement"
  | "tile_or_slate_repair"
  | "flat_roof_replacement"
  | "leak_investigation"
  | "gutters_fascias_soffits"
  | "other";

/** Qualitative access rating derived from pitch, planes, storeys, property type. */
export type AccessScore = "easy" | "moderate" | "difficult";

export type DashboardLead = {
  id: string;
  status: LeadStatus;
  leadType: "quote" | "manual_consultation";
  jobType: JobType;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  addressFormatted: string;
  addressPostcode: string;
  quoteMinExVat: number | null;
  quoteMaxExVat: number | null;
  /** Mock-only — not persisted yet. */
  accessScore: AccessScore;
  /** Distance from the roofer's base, miles. Not persisted yet — null for
   *  real leads until the widget/backend compute and store it. */
  distanceMiles: number | null;
  receivedAt: string; // ISO timestamp
  /** Hidden from the main tabs; shown under "Archived". */
  archived?: boolean;
};

/** Per-roofer pricing profile edited on the Account page (mock, not persisted). */
export type PricingProfile = {
  materials: { key: string; label: string; unit: string; rate: number }[];
  labourPerDay: number;
  minimumCallout: number;
  skipHire: number;
  scaffoldPerWeek: number;
  vatRegistered: boolean;
};

export type RooferProfile = {
  name: string;
  slug: string;
  base: string;
  plan: string;
  contactEmail: string;
};
