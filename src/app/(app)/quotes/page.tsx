import type { DashboardLead, JobType, LeadStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import QuotesClient from "@/components/QuotesClient";

type LeadRow = {
  id: string;
  status: LeadStatus;
  lead_type: string | null;
  job_type: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address_formatted: string | null;
  address_postcode: string | null;
  quote_min_ex_vat: number | null;
  quote_max_ex_vat: number | null;
  received_at: string;
};

/** Map a persisted lead row to the dashboard view model.
 *  accessScore/distance aren't stored yet — defaulted (see types.ts note). */
function mapRow(row: LeadRow): DashboardLead {
  return {
    id: row.id,
    status: row.status,
    leadType: row.lead_type === "manual_consultation" ? "manual_consultation" : "quote",
    jobType: (row.job_type as JobType) ?? "other",
    contactName: row.contact_name ?? "Unknown",
    contactPhone: row.contact_phone ?? "",
    contactEmail: row.contact_email,
    addressFormatted: row.address_formatted ?? "",
    addressPostcode: row.address_postcode ?? "",
    quoteMinExVat: row.quote_min_ex_vat,
    quoteMaxExVat: row.quote_max_ex_vat,
    accessScore: "moderate",
    distanceMiles: null,
    receivedAt: row.received_at,
  };
}

// Leads change often; don't cache this page.
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(
      "id,status,lead_type,job_type,contact_name,contact_phone,contact_email,address_formatted,address_postcode,quote_min_ex_vat,quote_max_ex_vat,received_at",
    )
    .order("received_at", { ascending: false });

  const leads = ((data as LeadRow[] | null) ?? []).map(mapRow);
  return <QuotesClient initialLeads={leads} />;
}
