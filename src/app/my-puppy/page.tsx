"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type AnyRow = Record<string, any>;

export default function MyPuppyPage() {
  const supabase = getBrowserClient();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [puppy, setPuppy] = useState<AnyRow | null>(null);
  const [weights, setWeights] = useState<AnyRow[]>([]);
  const [milestones, setMilestones] = useState<AnyRow[]>([]);
  const [vaccinations, setVaccinations] = useState<AnyRow[]>([]);
  const [dewormings, setDewormings] = useState<AnyRow[]>([]);
  const [payments, setPayments] = useState<AnyRow[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          console.error("auth error", authErr.message);
          setErrorMsg("Could not verify your login. Please sign in again.");
          return;
        }

        const user = authData?.user;
        if (!user) {
          setErrorMsg("You must be signed in to view your puppy.");
          return;
        }

        // Find the puppy assignment for this user
        const { data: assignment, error: assignErr } = await supabase
          .from("puppy_assignments")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (assignErr) {
          console.error("assignment error", assignErr.message);
        }

        if (!assignment || !assignment.puppy_id) {
          setErrorMsg(
            "No puppy has been assigned to your account yet. Once we match you with a puppy, their details will appear here."
          );
          return;
        }

        const puppyId = assignment.puppy_id as number;

        const [
          puppyRes,
          weightsRes,
          milestonesRes,
          vacRes,
          dewRes,
          payRes,
        ] = await Promise.all([
          supabase
            .from("puppies")
            .select("*")
            .eq("id", puppyId)
            .maybeSingle(),
          supabase
            .from("puppy_weights")
            .select("*")
            .eq("puppy_id", puppyId)
            .order("weighed_at", { ascending: true }),
          supabase
            .from("puppy_milestones")
            .select("*")
            .eq("puppy_id", puppyId)
            .order("date", { ascending: true }),
          supabase
            .from("puppy_vaccinations")
            .select("*")
            .eq("puppy_id", puppyId)
            .order("date", { ascending: true }),
          supabase
            .from("puppy_dewormings")
            .select("*")
            .eq("puppy_id", puppyId)
            .order("date", { ascending: true }),
          supabase
            .from("puppy_payments")
            .select("*")
            .eq("puppy_id", puppyId)
            .order("created_at", { ascending: true }),
        ]);

        if (puppyRes.error) {
          console.error("puppy load error", puppyRes.error.message);
          setErrorMsg("Could not load your puppy details.");
          return;
        }

        if (!puppyRes.data) {
          setErrorMsg("Puppy record not found.");
          return;
        }

        setPuppy(puppyRes.data as AnyRow);
        setWeights((weightsRes.data || []) as AnyRow[]);
        setMilestones((milestonesRes.data || []) as AnyRow[]);
        setVaccinations((vacRes.data || []) as AnyRow[]);
        setDewormings((dewRes.data || []) as AnyRow[]);
        setPayments((payRes.data || []) as AnyRow[]);
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="mp-root">
        <h1 className="mp-title">My Puppy</h1>
        <div className="mp-empty">Loading…</div>
        <Style />
      </section>
    );
  }

  if (errorMsg || !puppy) {
    return (
      <section className="mp-root">
        <h1 className="mp-title">My Puppy</h1>
        <div className="mp-empty">{errorMsg || "No puppy assigned."}</div>
        <Style />
      </section>
    );
  }

  return (
    <section className="mp-root">
      <h1 className="mp-title">My Puppy</h1>
      <p className="mp-subtitle">
        Track your Chihuahua&apos;s key details, growth, health records, and
        payments here.
      </p>

      <div className="mp-grid">
        {/* BASIC PROFILE */}
        <div className="mp-card">
          <h2 className="mp-card-title">Puppy Profile</h2>
          <div className="mp-profile-grid">
            <div>
              <div className="mp-puppy-name">
                {puppy.name || puppy.call_name || "Your puppy"}
              </div>
              <div className="mp-puppy-meta">
                {puppy.sex && (
                  <span>{String(puppy.sex).toUpperCase()}</span>
                )}
                {puppy.color && <span>{puppy.color}</span>}
                {puppy.coat_type && <span>{puppy.coat_type}</span>}
                {puppy.registry && <span>{puppy.registry}</span>}
              </div>
              <div className="mp-puppy-detail-list">
                {puppy.dob && (
                  <div>
                    <strong>DOB:</strong>{" "}
                    {new Date(puppy.dob).toLocaleDateString()}
                  </div>
                )}
                {puppy.ready_date && (
                  <div>
                    <strong>Ready to go home:</strong>{" "}
                    {new Date(puppy.ready_date).toLocaleDateString()}
                  </div>
                )}
                {puppy.price && (
                  <div>
                    <strong>Price:</strong> $
                    {Number(puppy.price).toLocaleString()}
                  </div>
                )}
                {puppy.deposit_amount && (
                  <div>
                    <strong>Deposit:</strong> $
                    {Number(puppy.deposit_amount).toLocaleString()}
                  </div>
                )}
                {puppy.sire_name && (
                  <div>
                    <strong>Sire:</strong> {puppy.sire_name}
                  </div>
                )}
                {puppy.dam_name && (
                  <div>
                    <strong>Dam:</strong> {puppy.dam_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WEIGHTS */}
        <div className="mp-card">
          <h2 className="mp-card-title">Growth / Weights</h2>
          {weights.length === 0 ? (
            <div className="mp-empty-small">No weights recorded yet.</div>
          ) : (
            <table className="mp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.id}>
                    <td>
                      {w.weighed_at
                        ? new Date(w.weighed_at).toLocaleDateString()
                        : ""}
                    </td>
                    <td>
                      {w.weight_oz
                        ? `${w.weight_oz} oz`
                        : w.weight_lbs
                        ? `${w.weight_lbs} lbs`
                        : ""}
                    </td>
                    <td>{w.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* VACCINATIONS / DEWORMING */}
        <div className="mp-card">
          <h2 className="mp-card-title">Vaccinations &amp; Deworming</h2>
          <div className="mp-two-col">
            <div>
              <h3 className="mp-subheading">Vaccinations</h3>
              {vaccinations.length === 0 ? (
                <div className="mp-empty-small">
                  No vaccinations recorded yet.
                </div>
              ) : (
                <ul className="mp-list">
                  {vaccinations.map((v) => (
                    <li key={v.id}>
                      <strong>
                        {v.date
                          ? new Date(v.date).toLocaleDateString()
                          : ""}
                      </strong>{" "}
                      – {v.vaccine || v.label || "Vaccine"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="mp-subheading">Deworming</h3>
              {dewormings.length === 0 ? (
                <div className="mp-empty-small">
                  No deworming treatments recorded yet.
                </div>
              ) : (
                <ul className="mp-list">
                  {dewormings.map((d) => (
                    <li key={d.id}>
                      <strong>
                        {d.date
                          ? new Date(d.date).toLocaleDateString()
                          : ""}
                      </strong>{" "}
                      – {d.product || d.label || "Dewormer"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* MILESTONES */}
        <div className="mp-card">
          <h2 className="mp-card-title">Milestones</h2>
          {milestones.length === 0 ? (
            <div className="mp-empty-small">
              We&apos;ll start posting milestones (eyes open, walking, first
              shots, etc.) as your puppy grows.
            </div>
          ) : (
            <ul className="mp-timeline">
              {milestones.map((m) => (
                <li key={m.id}>
                  <div className="mp-timeline-date">
                    {m.date
                      ? new Date(m.date).toLocaleDateString()
                      : ""}
                  </div>
                  <div className="mp-timeline-body">
                    <div className="mp-timeline-title">
                      {m.label || "Milestone"}
                    </div>
                    {m.description && (
                      <div className="mp-timeline-text">
                        {m.description}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PAYMENTS */}
        <div className="mp-card">
          <h2 className="mp-card-title">Payments</h2>
          {payments.length === 0 ? (
            <div className="mp-empty-small">
              No payments recorded for this puppy yet.
            </div>
          ) : (
            <>
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        $
                        {Number(
                          p.amount || p.payment_amount || 0
                        ).toLocaleString()}
                      </td>
                      <td>{p.note || p.description || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mp-summary">
                <span>
                  Total paid: $
                  {payments
                    .reduce(
                      (sum, p) =>
                        sum +
                        Number(p.amount || p.payment_amount || 0),
                      0
                    )
                    .toLocaleString()}
                </span>
                {puppy.price && (
                  <span>
                    Remaining balance: $
                    {Math.max(
                      0,
                      Number(puppy.price) -
                        payments.reduce(
                          (sum, p) =>
                            sum +
                            Number(
                              p.amount || p.payment_amount || 0
                            ),
                          0
                        )
                    ).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Style />
    </section>
  );
}

function Style() {
  return (
    <style jsx>{`
      .mp-root {
        padding: 18px 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .mp-title {
        font-size: 22px;
        font-weight: 700;
      }

      .mp-subtitle {
        font-size: 13px;
        color: #9ca3af;
      }

      .mp-empty {
        margin-top: 10px;
        font-size: 13px;
        color: #9ca3af;
      }

      .mp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }

      .mp-card {
        border-radius: 22px;
        border: 1px solid #111827;
        background: radial-gradient(
            140% 200% at 0% 0%,
            rgba(15, 23, 42, 0.9),
            #020617
          );
        box-shadow: 0 20px 42px rgba(0, 0, 0, 0.9);
        padding: 14px 15px 16px;
      }

      .mp-card-title {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 600;
      }

      .mp-profile-grid {
        display: flex;
        gap: 12px;
      }

      .mp-puppy-name {
        font-size: 18px;
        font-weight: 700;
      }

      .mp-puppy-meta {
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 11px;
        color: #9ca3af;
      }

      .mp-puppy-meta span {
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid #1f2937;
        background: #020617;
      }

      .mp-puppy-detail-list {
        margin-top: 8px;
        font-size: 12px;
      }

      .mp-puppy-detail-list div {
        margin-bottom: 3px;
      }

      .mp-empty-small {
        font-size: 12px;
        color: #9ca3af;
      }

      .mp-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      .mp-table th,
      .mp-table td {
        padding: 4px 6px;
        border-bottom: 1px solid #111827;
      }

      .mp-table th {
        text-align: left;
        font-weight: 600;
        font-size: 11px;
        color: #9ca3af;
      }

      .mp-two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .mp-subheading {
        font-size: 13px;
        margin: 0 0 4px;
      }

      .mp-list {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 12px;
      }

      .mp-list li {
        margin-bottom: 4px;
      }

      .mp-timeline {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 12px;
      }

      .mp-timeline li {
        display: grid;
        grid-template-columns: 90px minmax(0, 1fr);
        gap: 8px;
        padding: 4px 0;
        border-bottom: 1px solid #111827;
      }

      .mp-timeline-date {
        color: #9ca3af;
        font-size: 11px;
      }

      .mp-timeline-title {
        font-weight: 600;
      }

      .mp-timeline-text {
        color: #9ca3af;
      }

      .mp-summary {
        margin-top: 8px;
        font-size: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      @media (max-width: 720px) {
        .mp-root {
          padding-inline: 12px;
        }
        .mp-two-col {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `}</style>
  );
}
