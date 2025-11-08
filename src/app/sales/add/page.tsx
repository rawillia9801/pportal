/* ============================================
   CHANGELOG
   - 2025-11-08: Migrate from @supabase/auth-helpers-nextjs
                 to @supabase/ssr browser client.
                 Add minimal working Add Sale form.
   ============================================
   ANCHOR: SALES_ADD_PAGE
*/
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

type Platform = "Walmart" | "Walmart WFS" | "eBay" | "Puppies" | "Other";
type Category = "Pet Supplies" | "Electronics" | "Apparel" | "Miscellaneous";

type FormState = {
  platform: Platform;
  category: Category;
  item_name: string;
  salesprice: number;
  cost: number;
  shippingcost: number;
  commission: number;
  transactiontype: "Sale";
};

export default function AddSale() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    platform: "Walmart",
    category: "Pet Supplies",
    item_name: "",
    salesprice: 0,
    cost: 0,
    shippingcost: 0,
    commission: 0.15, // 15% default for Walmart/WFS (you can change per platform below)
    transactiontype: "Sale",
  });

  // Auto-commission helper per platform (adjust as you wish)
  function defaultCommission(p: Platform) {
    if (p === "Walmart" || p === "Walmart WFS") return 0.15;
    if (p === "eBay") return 0.13; // example
    if (p === "Puppies") return 0; // no marketplace fee
    return 0.1; // Other
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      // Profit = salesprice - cost - shippingcost - (salesprice * commission)
      const commissionAmount = form.salesprice * Number(form.commission || 0);
      const profit =
        Number(form.salesprice || 0) -
        Number(form.cost || 0) -
        Number(form.shippingcost || 0) -
        commissionAmount;

      const payload = {
        created_at: new Date().toISOString(),
        platform: form.platform,
        category: form.category,
        name: form.item_name,
        salesprice: Number(form.salesprice),
        cost: Number(form.cost),
        shippingcost: Number(form.shippingcost),
        commission: commissionAmount,
        profit,
        transactiontype: form.transactiontype, // "Sale"
      };

      const { error } = await supabase.from("transactions").insert(payload);

      if (error) {
        setMsg(`Save failed: ${error.message}`);
      } else {
        setMsg("Saved ✅");
        // go back to list or dashboard if you have one:
        // router.push("/sales");
      }
    } catch (err: any) {
      setMsg(`Unexpected error: ${err?.message || String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={wrap}>
      <h1 style={h1}>Add Sale</h1>

      <form onSubmit={handleSubmit} style={card}>
        <div style={row}>
          <label style={label}>Platform</label>
          <select
            value={form.platform}
            onChange={(e) => {
              const p = e.target.value as Platform;
              update("platform", p);
              update("commission", defaultCommission(p));
            }}
            style={input}
          >
            <option>Walmart</option>
            <option>Walmart WFS</option>
            <option>eBay</option>
            <option>Puppies</option>
            <option>Other</option>
          </select>
        </div>

        <div style={row}>
          <label style={label}>Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value as Category)}
            style={input}
          >
            <option>Pet Supplies</option>
            <option>Electronics</option>
            <option>Apparel</option>
            <option>Miscellaneous</option>
          </select>
        </div>

        <div style={row}>
          <label style={label}>Item Name</label>
          <input
            value={form.item_name}
            onChange={(e) => update("item_name", e.target.value)}
            style={input}
            placeholder="What sold?"
            required
          />
        </div>

        <div style={grid}>
          <div style={col}>
            <label style={label}>Sales Price</label>
            <input
              type="number"
              step="0.01"
              value={form.salesprice}
              onChange={(e) => update("salesprice", Number(e.target.value))}
              style={input}
              required
            />
          </div>
          <div style={col}>
            <label style={label}>Cost of Goods</label>
            <input
              type="number"
              step="0.01"
              value={form.cost}
              onChange={(e) => update("cost", Number(e.target.value))}
              style={input}
              required
            />
          </div>
          <div style={col}>
            <label style={label}>Shipping Cost</label>
            <input
              type="number"
              step="0.01"
              value={form.shippingcost}
              onChange={(e) => update("shippingcost", Number(e.target.value))}
              style={input}
            />
          </div>
          <div style={col}>
            <label style={label}>Commission (rate)</label>
            <input
              type="number"
              step="0.01"
              value={form.commission}
              onChange={(e) => update("commission", Number(e.target.value))}
              style={input}
            />
            <small style={muted}>
              Example: 0.15 = 15% (auto-updates when you change platform)
            </small>
          </div>
        </div>

        <div style={{ ...row, marginTop: 14 }}>
          <button type="submit" disabled={submitting} style={btnPrimary}>
            {submitting ? "Saving…" : "Save Sale"}
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: 10, color: msg.includes("✅") ? "#2fa36b" : "#cc3344" }}>
            {msg}
          </div>
        )}
      </form>
    </main>
  );
}

/* Minimal inline styles to avoid styled-jsx */
const wrap: React.CSSProperties = { padding: 24, color: "#e7efff", background: "#0b1423", minHeight: "100vh" };
const h1: React.CSSProperties = { margin: "0 0 16px 0", fontSize: 28 };
const card: React.CSSProperties = { background: "#15243e", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16, maxWidth: 820 };
const row: React.CSSProperties = { display: "flex", gap: 12, marginBottom: 12, alignItems: "center" };
const label: React.CSSProperties = { minWidth: 140 };
const input: React.CSSProperties = { flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.06)", color: "#e7efff" };
const grid: React.CSSProperties = { display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" };
const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const btnPrimary: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", color: "#fff", border: "none", fontWeight: 700 };
const muted: React.CSSProperties = { color: "#9db1d8" };
