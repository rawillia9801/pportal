// src/app/puppies/page.tsx
export const dynamic = "force-dynamic";

/* Available Puppies (server/RSC-safe) */
import Link from "next/link";
import { createRscClient } from "@/lib/supabase/server";

type Puppy = {
  id: string;
  name?: string;
  price?: number;
  status?: string;
  gender?: string;
  registry?: string;
  dob?: string;
  date_of_birth?: string;
  ready_date?: string;
  photos?: string[];
};

export default async function PuppiesPage() {
  const supabase = createRscClient();

  const { data, error } = await supabase
    .from("puppies")
    .select("*")
    .neq("status", "Sold");

  if (error) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Available Puppies</h1>
        <p style={lead}>Couldn’t load puppies: {error.message}</p>
      </main>
    );
  }

  const puppies = (data ?? []) as Puppy[];

  return (
    <main style={wrap}>
      <h1 style={h1}>Available Puppies</h1>
      <p style={lead}>Browse current pups. Click a card for details.</p>

      <section style={grid}>
        {puppies.map((p) => {
          const title = p.name ?? `Puppy ${p.id.slice(0, 6)}`;
          const price =
            typeof p.price === "number" ? `$${p.price.toLocaleString()}` : "—";
          const status = p.status ?? "Available";
          const gender = p.gender ?? "—";
          const registry = p.registry ?? "—";
          const dob = p.dob ?? p.date_of_birth ?? null;
          const ready = p.ready_date ?? null;

          const photo =
            Array.isArray(p.photos) && p.photos.length ? p.photos[0] : undefined;

          return (
            <Link key={p.id} href={`/puppies/${p.id}`} style={card} prefetch={false}>
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
            </Link>
          );
        })}
      </section>
    </main>
  );
}

/* ---- inline styles ---- */
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
