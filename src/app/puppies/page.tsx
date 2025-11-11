// src/app/puppies/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";

type Pup = {
  id: string;
  name: string | null;
  price: number | null;
  gender: string | null;
  registry: string | null;
  status: "Available" | "Reserved" | "Sold" | null;
  dob: string | null;
  ready_date: string | null;
  photos: string[]; // assume text[]; if jsonb, cast accordingly in SQL/RLS
};

export default function PuppiesListPage() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<Pup[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("puppies")
        .select("*")
        .neq("status", "Sold");
      if (error) {
        setErr(error.message);
        return;
      }
      setRows((data as any[])?.map(normalize) ?? []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Available Puppies</h1>
        <p style={{ color: "#fca5a5" }}>Error: {err}</p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 style={h1}>Available Puppies</h1>
      <p style={lead}>Browse current pups.</p>

      <section style={grid}>
        {rows.map((p) => {
          const title = p.name ?? `Puppy ${p.id.slice(0, 6)}`;
          const price =
            p.price != null ? `$${Number(p.price).toLocaleString()}` : "—";
          const gender = p.gender ?? "—";
          const registry = p.registry ?? "—";
          const status = p.status ?? "Available";
          const dob = p.dob ?? undefined;
          const ready = p.ready_date ?? undefined;
          const photo = p.photos?.[0];

          return (
            <article key={p.id} style={card}>
              <div style={thumbWrap}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={title} style={thumb} />
                ) : (
                  <div style={thumbPlaceholder}>No Photo</div>
                )}
              </div>

              <div style={meta}>
                <div style={rowBetween}>
                  <h3 style={titleStyle}>{title}</h3>
                  <span style={priceBadge}>{price}</span>
                </div>
                <div style={pillRow}>
                  <span style={pill}>Status: {status}</span>
                  <span style={pill}>Gender: {gender}</span>
                  <span style={pill}>Registry: {registry}</span>
                  {dob && <span style={pill}>DOB: {dob}</span>}
                  {ready && <span style={pill}>Ready: {ready}</span>}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function normalize(row: any): Pup {
  return {
    id: row.id,
    name: row.name ?? null,
    price: row.price ?? null,
    gender: row.gender ?? null,
    registry: row.registry ?? null,
    status: row.status ?? null,
    dob: row.dob ?? row.date_of_birth ?? null,
    ready_date: row.ready_date ?? null,
    photos: Array.isArray(row.photos) ? row.photos : [],
  };
}

/* ---- Inline styles ---- */
const wrap: React.CSSProperties = {
  padding: 24,
  color: "#e7efff",
  background: "#0b1423",
  minHeight: "100vh",
};
const h1: React.CSSProperties = { margin: "0 0 8px 0", fontSize: 32 };
const lead: React.CSSProperties = { margin: "0 0 18px 0", opacity: 0.9 };
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  display: "block",
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
  textDecoration: "none",
  color: "#e7efff",
  overflow: "hidden",
};

const thumbWrap: React.CSSProperties = {
  aspectRatio: "4 / 3",
  background: "rgba(255,255,255,.06)",
};
const thumb: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const thumbPlaceholder: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  opacity: 0.7,
};

const meta: React.CSSProperties = { padding: 12 };
const rowBetween: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 18 };
const priceBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(59,130,246,.25)",
  border: "1px solid rgba(59,130,246,.45)",
};
const pillRow: React.CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginTop: 8,
};
const pill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.06)",
};
