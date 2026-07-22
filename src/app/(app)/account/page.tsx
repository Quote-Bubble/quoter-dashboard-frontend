"use client";

import { useState } from "react";

import { mockPricing, rooferProfile } from "@/lib/mock-data";
import PageHeader from "@/components/PageHeader";
import PricingForm from "@/components/PricingForm";
import Toast from "@/components/Toast";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

export default function AccountPage() {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Account"
        subtitle="Set the prices Quoter uses to calculate your instant quotes."
      />

      {/* Profile summary */}
      <div className="surface mb-6 flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-brand-400 to-brand-600 text-xl font-semibold text-white">
            {rooferProfile.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              {rooferProfile.name}
            </h2>
            <p className="text-sm text-muted">{rooferProfile.contactEmail}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:flex sm:gap-10">
          <InfoTile label="Plan" value={rooferProfile.plan} />
          <InfoTile label="Base" value={rooferProfile.base} />
        </div>
      </div>

      <PricingForm
        initial={mockPricing}
        onSaved={() => setToast("Pricing saved")}
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
