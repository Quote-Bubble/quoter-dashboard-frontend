import type { DashboardLead, JobType, LeadStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getRoofer } from "@/lib/roofer";
import QuotesClient from "@/components/QuotesClient";
import PageHeader from "@/components/PageHeader";
import NotLinkedNotice from "@/components/NotLinkedNotice";

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

/** Map a persisted lead row to the dashboard view model. */
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
    receivedAt: row.received_at,
  };
}

// Leads change often; don't cache this page.
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No roofer membership means RLS will return zero leads no matter what — say
  // that plainly instead of rendering an empty table.
  const roofer = await getRoofer();
  if (!roofer) {
    return (
      <>
        <PageHeader title="Quotes" />
        <NotLinkedNotice userId={user?.id ?? "unknown"} />
      </>
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select(
      "id,status,lead_type,job_type,contact_name,contact_phone,contact_email,address_formatted,address_postcode,quote_min_ex_vat,quote_max_ex_vat,received_at",
    )
    .order("received_at", { ascending: false });

  if (error) {
    return (
      <>
        <PageHeader title="Quotes" />
        <div className="surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Couldn’t load your leads
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{error.message}</p>
        </div>
      </>
    );
  }

  const leads = ((data as LeadRow[] | null) ?? []).map(mapRow);
  return <QuotesClient initialLeads={leads} rooferSlug={roofer.slug} />;
}
