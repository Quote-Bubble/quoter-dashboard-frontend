# Backend insert contract (`quoter-api-backend`)

Without this change, Supabase stays empty and the dashboard has nothing to show.

Today [`POST /api/lead`](https://github.com/Quote-Bubble/quoter-api-backend) validates the payload, optionally POSTs to `LEAD_WEBHOOK_URL`, and returns `{ ok, leadId }`. It does not store the lead.

## Required behavior

After validation, **before or alongside** the webhook:

1. Resolve `roofers.id` where `roofers.slug = payload.rooferId`  
2. If no roofer row exists → return `400` / `404` (do not silently drop)  
3. Insert into `leads` using the same `leadId` you already generate (`randomUUID()`)  
4. Keep existing webhook delivery (write-then-webhook is fine)  
5. Return `202` as today  

Use the **service role** key server-side only (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`). That bypasses RLS, which is correct for trusted API writes.

## Suggested row mapping

| Column | Source |
|--------|--------|
| `id` | `leadId` (UUID you generate) |
| `roofer_id` | `roofers.id` for `payload.rooferId` |
| `status` | `'new'` |
| `lead_type` | `payload.leadType` |
| `job_type` | `payload.jobType` |
| `contact_name` | `payload.contact.name` |
| `contact_phone` | `payload.contact.phone` |
| `contact_email` | `payload.contact.email` |
| `address_formatted` | `payload.address.formatted` ?? `payload.address.line` |
| `address_postcode` | `payload.address.postcode` |
| `quote_min_ex_vat` | `payload.quoteRange?.minExVat` |
| `quote_max_ex_vat` | `payload.quoteRange?.maxExVat` |
| `payload` | full JSON body (plus `leadId` / `receivedAt` if you want) |
| `received_at` | `now()` ISO |

## Example (Supabase JS on the server)

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: roofer, error: rooferError } = await supabase
  .from("roofers")
  .select("id")
  .eq("slug", payload.rooferId)
  .maybeSingle();

if (rooferError || !roofer) {
  // reject unknown rooferId
}

const { error: insertError } = await supabase.from("leads").insert({
  id: leadId,
  roofer_id: roofer.id,
  status: "new",
  lead_type: payload.leadType,
  job_type: payload.jobType,
  contact_name: payload.contact.name,
  contact_phone: payload.contact.phone,
  contact_email: payload.contact.email,
  address_formatted: payload.address.formatted ?? payload.address.line,
  address_postcode: payload.address.postcode,
  quote_min_ex_vat: payload.quoteRange?.minExVat ?? null,
  quote_max_ex_vat: payload.quoteRange?.maxExVat ?? null,
  payload: { ...payload, leadId },
  received_at: new Date().toISOString(),
});
```

## Env on Vercel (`quoter-api-backend`)

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
LEAD_WEBHOOK_URL=...   # optional; keep existing behavior
```

## Dashboard reads

The dashboard uses the **anon key + user session**. RLS policies ensure `select` / `update` only for rows whose `roofer_id` is in `roofer_members` for `auth.uid()`. Do not use the service role in the browser.
