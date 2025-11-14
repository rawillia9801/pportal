// src/app/available-puppies/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-14: New Available Puppies page
                 • Light, card-grid layout
                 • Puppies grouped by litter_name
                 • Smaller cards, easier to scan
   ANCHOR: AVAILABLE_PUPPIES_PAGE
   ============================================ */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * EXPECTED COLUMNS (you can adjust to match your table):
 * puppies table:
 *  - id (uuid or int)
 *  - name (text)
 *  - litter_name (text)
 *  - dob (date or text)
 *  - ready_date (date or text)
 *  - price (numeric)
 *  - deposit_amount (numeric)
 *  - gender (text)
 *  - color (text)
 *  - coat_type (text)
 *  - registry (text)        e.g. 'AKC', 'CKC', 'ACA'
 *  - sire (text)
 *  - dam (text)
 *  - birth_weight_oz (numeric)
 *  - projected_weight_lbs (numeric)
 *  - status (text)          e.g. 'READY', 'RESERVED', 'SOLD'
 *  - main_photo_url (text)  optional
 */

type Puppy = {
  id: string | number;
  name: string | null;
  litter_name: string | null;
  dob: string | null;
  ready_date: string | null;
  price: number | null;
  deposit_amount: number | null;
  gender: string | null;
  color: string | null;
  coat_type: string | null;
  registry: string | null;
  sire: string | null;
  dam: string | null;
  birth_weight_oz: number | null;
  projected_weight_lbs: number | null;
  status: string | null;
  main_photo_url: string | null;
};

type LitterGroup = {
  litterName: string;
  sire: string | null;
  dam: string | null;
  dob: string | null;
  readyDate: string | null;
  puppies: Puppy[];
};

export default function AvailablePuppiesPage() {
  const supabase = getBrowserClient();

  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from("puppies")
          .select(
            `
            id,
            name,
            litter_name,
            dob,
            ready_date,
            price,
            deposit_amount,
            gender,
            color,
            coat_type,
            registry,
            sire,
            dam,
            birth_weight_oz,
            projected_weight_lbs,
            status,
            main_photo_url
          `
          )
          .order("dob", { ascending: false });

        if (dbError) throw dbError;

        if (!cancelled) {
          setPuppies(((data as any) as Puppy[]) ?? []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Unable to load available puppies right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const litters: LitterGroup[] = useMemo(() => {
    const map = new Map<string, LitterGroup>();

    for (const p of puppies) {
      const key = p.litter_name || "Available Puppies";
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          litterName: key,
          sire: p.sire,
          dam: p.dam,
          dob: p.dob,
          readyDate: p.ready_date,
          puppies: [p],
        });
      } else {
        existing.puppies.push(p);
      }
    }

    // Sort litters newest → oldest by DOB if present
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const ad = a.dob ? new Date(a.dob).getTime() : 0;
      const bd = b.dob ? new Date(b.dob).getTime() : 0;
      return bd - ad;
    });
    return arr;
  }, [puppies]);

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <div>
            <h1>Available Chihuahua Puppies</h1>
            <p>
              Browse our current litters below. Each section is grouped by litter so
              you can see siblings together along with their parents and important
              details.
            </p>
          </div>
          <div className="headerLinks">
            <Link href="/application" className="btn primary">
              Start Application
            </Link>
            <Link href="/faq" className="btn ghost">
              View FAQs
            </Link>
          </div>
        </header>

        {loading && <p className="muted">Loading available puppies…</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && litters.length === 0 && (
          <div className="empty">
            <h2>No puppies are currently listed as available.</h2>
            <p>
              We may have upcoming litters or puppies that are not yet posted here.
              Please check back soon, join our waiting list, or send us a message
              with what you&apos;re looking for.
            </p>
            <Link href="/message" className="btn primary">
              Message the Breeder
            </Link>
          </div>
        )}

        <div className="litterStack">
          {litters.map((litter) => (
            <section key={litter.litterName} className="litterCard">
              <div className="litterHeader">
                <div>
                  <h2>{litter.litterName}</h2>
                  <p className="litterMeta">
                    {formatParents(litter.sire, litter.dam)}
                    {formatLitterDates(litter.dob, litter.readyDate)}
                  </p>
                </div>
              </div>

              <div className="puppyGrid">
                {litter.puppies.map((pup) => (
                  <article key={pup.id} className="puppyCard">
                    <div className="puppyTop">
                      <div className="nameRow">
                        <h3>{pup.name || "Unnamed Puppy"}</h3>
                        {pup.status && (
                          <span className={`status status-${statusVariant(pup.status)}`}>
                            {prettyStatus(pup.status)}
                          </span>
                        )}
                      </div>

                      {pup.main_photo_url && (
                        <div className="photoWrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pup.main_photo_url}
                            alt={pup.name || "Chihuahua puppy"}
                          />
                        </div>
                      )}

                      <dl className="facts">
                        <div>
                          <dt>DOB</dt>
                          <dd>{formatDate(pup.dob)}</dd>
                        </div>
                        <div>
                          <dt>Ready</dt>
                          <dd>{formatDate(pup.ready_date)}</dd>
                        </div>
                        <div>
                          <dt>Gender</dt>
                          <dd>{pup.gender || "—"}</dd>
                        </div>
                        <div>
                          <dt>Color</dt>
                          <dd>{pup.color || "—"}</dd>
                        </div>
                        <div>
                          <dt>Coat</dt>
                          <dd>{pup.coat_type || "—"}</dd>
                        </div>
                        <div>
                          <dt>Registry</dt>
                          <dd>{pup.registry || "—"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="puppyBottom">
                      <div className="priceRow">
                        <span className="price">
                          {pup.price != null ? formatMoney(pup.price) : "Price on request"}
                        </span>
                        {pup.deposit_amount != null && (
                          <span className="deposit">
                            Deposit: {formatMoney(pup.deposit_amount)}
                          </span>
                        )}
                      </div>

                      <div className="weights">
                        {pup.birth_weight_oz != null && (
                          <span>Birth weight: {pup.birth_weight_oz} oz</span>
                        )}
                        {pup.projected_weight_lbs != null && (
                          <span>
                            Projected adult weight: {pup.projected_weight_lbs} lbs
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/application?puppy_id=${encodeURIComponent(
                          String(pup.id)
                        )}`}
                        className="btn small"
                      >
                        Request this Puppy
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="ft">
          <span className="mini">
            © {new Date().getFullYear()} Southwest Virginia Chihuahua
          </span>
          <span className="mini">
            Carefully bred, well-loved Chihuahuas in Southwest Virginia.
          </span>
        </footer>
      </div>

      <style jsx>{`
        :root {
          --ink: #1e232d;
          --muted: #6b7280;
          --bg-grad-a: #f7faff;
          --bg-grad-b: #eef2ff;
          --bg-grad-c: #fdf6ef;
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(37, 99, 235, 0.16);
          --accent: #5a6cff;
        }

        .page {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            var(--bg-grad-a),
            var(--bg-grad-b) 45%,
            var(--bg-grad-c)
          );
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 20px 28px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .header h1 {
          margin: 0 0 6px;
          font-size: clamp(24px, 3vw, 30px);
        }

        .header p {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
          max-width: 640px;
        }

        .headerLinks {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .btn {
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .btn.primary {
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
        }

        .btn.ghost {
          background: #ffffffcc;
          color: var(--ink);
          border-color: var(--panel-border);
        }

        .btn.small {
          padding: 7px 10px;
          font-size: 12px;
          margin-top: 6px;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
        }

        .muted {
          font-size: 14px;
          color: var(--muted);
          margin-top: 4px;
        }

        .alert {
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 0.86rem;
          margin-top: 10px;
        }

        .alert-error {
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: #fef2f2;
          color: #991b1b;
        }

        .empty {
          margin-top: 26px;
          padding: 20px 18px 18px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid var(--panel-border);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          text-align: left;
          max-width: 720px;
        }

        .empty h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .empty p {
          margin: 0 0 10px;
          font-size: 14px;
          color: var(--muted);
        }

        .litterStack {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .litterCard {
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid var(--panel-border);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          padding: 16px 18px 18px;
        }

        .litterHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .litterHeader h2 {
          margin: 0 0 4px;
          font-size: 18px;
        }

        .litterMeta {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
        }

        .puppyGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }

        .puppyCard {
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          background: #f9fafb;
          padding: 10px 10px 9px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }

        .puppyTop {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nameRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }

        .nameRow h3 {
          margin: 0;
          font-size: 14px;
        }

        .status {
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 11px;
          border: 1px solid transparent;
        }

        .status-available {
          background: #ecfdf3;
          border-color: rgba(22, 163, 74, 0.4);
          color: #166534;
        }

        .status-reserved {
          background: #fef9c3;
          border-color: rgba(202, 138, 4, 0.5);
          color: #854d0e;
        }

        .status-sold {
          background: #fee2e2;
          border-color: rgba(220, 38, 38, 0.5);
          color: #991b1b;
        }

        .photoWrap {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #e5e7eb;
          max-height: 140px;
        }

        .photoWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .facts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px 8px;
          margin: 0;
        }

        .facts div {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .facts dt {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #9ca3af;
        }

        .facts dd {
          margin: 0;
          font-size: 11px;
        }

        .puppyBottom {
          border-top: 1px dashed rgba(148, 163, 184, 0.7);
          padding-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .priceRow {
          display: flex;
          justify-content: space-between;
          gap: 6px;
          align-items: baseline;
        }

        .price {
          font-weight: 600;
        }

        .deposit {
          font-size: 11px;
          color: var(--muted);
        }

        .weights {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
          color: var(--muted);
        }

        .ft {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--muted);
        }

        .mini {
          font-size: 11px;
        }

        @media (max-width: 800px) {
          .header {
            flex-direction: column;
          }
          .headerLinks {
            flex-direction: row;
          }
          .headerLinks .btn {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .shell {
            padding: 16px 12px 24px;
          }
          .litterCard {
            padding: 14px 12px 14px;
          }
        }
      `}</style>
    </main>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatParents(sire: string | null, dam: string | null): string {
  if (sire && dam) return `Parents: ${sire} × ${dam}`;
  if (sire) return `Sire: ${sire}`;
  if (dam) return `Dam: ${dam}`;
  return "";
}

function formatLitterDates(dob: string | null, ready: string | null): string {
  const dobPart = dob ? ` • DOB: ${formatDate(dob)}` : "";
  const readyPart = ready ? ` • Ready: ${formatDate(ready)}` : "";
  return `${dobPart}${readyPart}`;
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function prettyStatus(raw: string): string {
  const val = raw.toUpperCase().trim();
  if (val === "READY" || val === "AVAILABLE") return "Available";
  if (val === "RESERVED" || val === "PENDING") return "Reserved";
  if (val === "SOLD") return "Sold";
  return raw;
}

function statusVariant(raw: string): "available" | "reserved" | "sold" {
  const val = raw.toUpperCase().trim();
  if (val === "READY" || val === "AVAILABLE") return "available";
  if (val === "RESERVED" || val === "PENDING") return "reserved";
  if (val === "SOLD") return "sold";
  return "available";
}
