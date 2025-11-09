"use client";

/* ============================================
   CHANGELOG
   - 2025-11-09: Fix TS error by removing `.catch`
                 on PostgrestFilterBuilder; add
                 safeCount() with Promise.all.
   ANCHOR: ADMIN_CLIENT
   ============================================ */

import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

type Counts = {
  applications: number;
  messages: number;
  payments: number;
  buyers: number;
  puppies: number;
};

export default function AdminClient() {
  const supabase = useMemo(() => getBrowserClient(), []);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      const c = await loadCounts(supabase);
      if (alive) setCounts(c);
    }
    load();

    return () => {
      alive = false;
    };
  }, [supabase]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 28, fontWeight: 800 }}>Admin Dashboard</div>

      {!counts ? (
        <div>Loading…</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))",
            gap: 10,
          }}
        >
          <StatCard label="Applications" value={counts.applications} />
          <StatCard label="Messages" value={counts.messages} />
          <StatCard label="Payments" value={counts.payments} />
          <StatCard label="Buyers" value={counts.buyers} />
          <StatCard label="Puppies" value={counts.puppies} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.06)",
      }}
    >
      <div style={{ opacity: 0.85, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

async function loadCounts(supabase: ReturnType<typeof getBrowserClient>) {
  // Table-not-found (Postgres) is code 42P01. Return 0 when optional/missing.
  async function safeCount(table: string, ignoreMissing = true): Promise<number> {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      // If table is optional or not created yet, treat as zero
      if (ignoreMissing && (error as any).code === "42P01") return 0;
      return 0; // or rethrow if you'd rather fail builds
    }
    return count ?? 0;
  }

  const [applications, messages, payments, buyers, puppies] = await Promise.all([
    safeCount("applications"),
    safeCount("messages"),
    safeCount("payments"),
    safeCount("buyers"),
    safeCount("puppies"),
  ]);

  return { applications, messages, payments, buyers, puppies };
}
