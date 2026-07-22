"use client";

import { useState } from "react";

import type { PricingProfile } from "@/lib/types";
import PricingForm from "@/components/PricingForm";
import Toast from "@/components/Toast";

/** Client wrapper so the Account page itself can stay a server component. */
export default function PricingPanel({
  rooferId,
  initial,
}: {
  rooferId: string;
  initial: PricingProfile;
}) {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <PricingForm
        rooferId={rooferId}
        initial={initial}
        onSaved={() => setToast("Pricing saved")}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
