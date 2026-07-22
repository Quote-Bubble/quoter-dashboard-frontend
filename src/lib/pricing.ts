import type { PricingProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Pricing lives in `roofer_pricing` (supabase/migrations/0002_roofer_pricing.sql),
 * one row per roofer, read and written under the same membership RLS as leads.
 *
 * Material keys deliberately match the widget's `Material` enum
 * (quoter-backend/lib/types.ts) so these rates can be joined to a lead's chosen
 * material once the widget is wired to read them.
 */

export const DEFAULT_PRICING: PricingProfile = {
  materials: [
    { key: "concrete_tile", label: "Concrete tile", unit: "£/m²", rate: 48 },
    { key: "clay_tile", label: "Clay tile", unit: "£/m²", rate: 72 },
    { key: "natural_slate", label: "Natural slate", unit: "£/m²", rate: 95 },
    { key: "flat_epdm", label: "EPDM rubber (flat)", unit: "£/m²", rate: 60 },
    { key: "flat_grp", label: "GRP fibreglass (flat)", unit: "£/m²", rate: 85 },
    { key: "felt", label: "Built-up felt (flat)", unit: "£/m²", rate: 45 },
  ],
  labourPerDay: 220,
  minimumCallout: 180,
  skipHire: 260,
  scaffoldPerWeek: 550,
  vatRegistered: true,
};

type PricingRow = {
  materials: PricingProfile["materials"] | null;
  labour_per_day: number | null;
  minimum_callout: number | null;
  skip_hire: number | null;
  scaffold_per_week: number | null;
  vat_registered: boolean | null;
};

/** Merge a stored row over the defaults so a partially-filled row still renders,
 *  and so newly added default materials appear for roofers who saved earlier. */
function rowToProfile(row: PricingRow): PricingProfile {
  const stored = row.materials?.length ? row.materials : null;
  const materials = stored
    ? DEFAULT_PRICING.materials.map((d) => {
        const match = stored.find((m) => m.key === d.key);
        return match ? { ...d, rate: match.rate } : d;
      })
    : DEFAULT_PRICING.materials;

  return {
    materials,
    labourPerDay: row.labour_per_day ?? DEFAULT_PRICING.labourPerDay,
    minimumCallout: row.minimum_callout ?? DEFAULT_PRICING.minimumCallout,
    skipHire: row.skip_hire ?? DEFAULT_PRICING.skipHire,
    scaffoldPerWeek: row.scaffold_per_week ?? DEFAULT_PRICING.scaffoldPerWeek,
    vatRegistered: row.vat_registered ?? DEFAULT_PRICING.vatRegistered,
  };
}

/** Stored pricing for a roofer, falling back to defaults when nothing is saved
 *  yet. RLS scopes the read; `rooferId` only narrows it to a single row. */
export async function getPricing(rooferId: string): Promise<PricingProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roofer_pricing")
    .select(
      "materials,labour_per_day,minimum_callout,skip_hire,scaffold_per_week,vat_registered",
    )
    .eq("roofer_id", rooferId)
    .maybeSingle();

  if (error || !data) return DEFAULT_PRICING;
  return rowToProfile(data as PricingRow);
}
