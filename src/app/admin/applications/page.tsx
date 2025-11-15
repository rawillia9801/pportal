"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type ApplicationRow = any;
type BuyerRow = any;
type PuppyRow = any;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "waitlist", label: "Waitlist" },
  { value: "denied", label: "Denied" },
];

export default function AdminApplicationsPage() {
  const supabase = getBrowserClient();

  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [puppies, setPuppies] = useState<PuppyRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "waitlist" | "denied">("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [buyerChoice, setBuyerChoice] = useState<string>("");
  const [puppyChoice, setPuppyChoice] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  // ---------- Load data ----------

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [appsRes, buyersRes, puppiesRes] = await Promise.all([
          supabase.from("applications").select("*").order("created_at", { ascending: false }),
          supabase.from("buyers").select("*").order("created_at", { ascending: false }),
          // if your puppies table uses a different column for status, you can tweak this later
          supabase.from("puppies").select("*").order("created_at", { ascending: false }),
        ]);

        if (appsRes.error) console.error("applications load error", appsRes.error.message);
        if (buyersRes.error) console.error("buyers load error", buyersRes.error.message);
        if (puppiesRes.error) console.error("puppies load error", puppiesRes.error.message);

        setApps(appsRes.data || []);
        setBuyers(buyersRes.data || []);
        setPuppies(puppiesRes.data || []);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedApp = useMemo(
    () => apps.find((a: any) => String(a.id) === String(selectedId)) ?? null,
    [apps, selectedId]
  );

  // ---------- Helpers ----------

  function appDisplayName(app: any) {
    return (
      app.full_name ||
      app.applicant_name ||
      [app.first_name, app.last_name].filter(Boolean).join(" ") ||
      "Unknown name"
    );
  }

  function appStatus(app: any): string {
    return (app.status || "pending").toLowerCase();
  }

  function appCreated(app: any): string {
    if (!app.created_at) return "";
    try {
      return new Date(app.created_at).toLocaleDateString();
    } catch {
      return String(app.created_at);
    }
  }

  function buyerDisplay(b: any) {
    return (
      b.full_name ||
      [b.first_name, b.last_name].filter(Boolean).join(" ") ||
      `Buyer #${b.id}`
    );
  }

  function puppyDisplay(p: any) {
    const pieces = [
      p.name || p.call_name || `Puppy #${p.id}`,
      p.sex ? String(p.sex).toUpperCase() : "",
      p.registry || "",
      p.status ? `(${p.status})` : "",
    ].filter(Boolean);
    return pieces.join(" · ");
  }

  const filteredApps = useMemo(() => {
    return apps.filter((app: any) => {
      const s = search.trim().toLowerCase();

      if (s) {
        const blob = JSON.stringify(app).toLowerCase();
        if (!blob.includes(s)) return false;
      }

      if (statusFilter !== "all") {
        const st = appStatus(app);
        if (st !== statusFilter) return false;
      }

      return true;
    });
  }, [apps, search, statusFilter]);

  // ---------- Status actions ----------

  async function handleStatusChange(nextStatus: "approved" | "waitlist" | "denied") {
    if (!selectedApp) return;
    setSavingStatus(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: nextStatus })
        .eq("id", selectedApp.id);

      if (error) {
        console.error("status update error", error.message);
        setMessage("Could not update status. Check console for details.");
        return;
      }

      setApps((prev) =>
        prev.map((a: any) =>
          a.id === selectedApp.id ? { ...a, status: nextStatus } : a
        )
      );
      setMessage(`Status set to ${nextStatus}.`);
    } finally {
      setSavingStatus(false);
    }
  }

  // ---------- Assignment actions ----------

  async function handleSaveAssignment() {
    if (!selectedApp) return;

    setSavingAssignment(true);
    setMessage("");

    try {
      let finalBuyerId: string | null = buyerChoice || null;

      // Option: create buyer from application
      if (buyerChoice === "__create__") {
        const payload: any = {
          full_name: appDisplayName(selectedApp),
          email: selectedApp.email ?? selectedApp.applicant_email ?? null,
          phone: selectedApp.phone ?? selectedApp.applicant_phone ?? null,
          source: selectedApp.source ?? "Application",
        };

        const { data, error } = await supabase
          .from("buyers")
          .insert(payload)
          .select("*")
          .maybeSingle();

        if (error) {
          console.error("create buyer error", error.message);
          setMessage("Could not create buyer from application.");
          return;
        }

        if (!data) {
          setMessage("Buyer not created – empty response.");
          return;
        }

        finalBuyerId = String(data.id);
        // refresh buyers list so the new buyer appears in the dropdown later
        setBuyers((prev) => [data, ...prev]);
      }

      const finalPuppyId = puppyChoice || null;

      // Link application to buyer / puppy
      const patch: any = {};
      if (finalBuyerId) patch.buyer_id = finalBuyerId;
      if (finalPuppyId) patch.puppy_id = finalPuppyId;

      if (Object.keys(patch).length > 0) {
        const { error: appUpdateErr } = await supabase
          .from("applications")
          .update(patch)
          .eq("id", selectedApp.id);

        if (appUpdateErr) {
          console.error("applications link error", appUpdateErr.message);
          setMessage("Could not update application record.");
          return;
        }
      }

      // Insert into buyer_puppies link table if both are present
      if (finalBuyerId && finalPuppyId) {
        const { error: linkErr } = await supabase
          .from("buyer_puppies")
          .insert({
            buyer_id: finalBuyerId,
            puppy_id: finalPuppyId,
          });

        if (linkErr) {
          console.error("buyer_puppies insert error", linkErr.message);
          // continue; not fatal for the rest
        }

        // Mark puppy reserved if there is a status column
        const { error: pupErr } = await supabase
          .from("puppies")
          .update({ status: "reserved" })
          .eq("id", finalPuppyId);

        if (pupErr) {
          console.error("puppy status update error", pupErr.message);
        }
      }

      // reflect in local state
      setApps((prev) =>
        prev.map((a: any) =>
          a.id === selectedApp.id
            ? {
                ...a,
                buyer_id: finalBuyerId ?? a.buyer_id,
                puppy_id: finalPuppyId ?? a.puppy_id,
              }
            : a
        )
      );

      setMessage("Assignment saved.");
    } finally {
      setSavingAssignment(false);
    }
  }

  // ---------- Render ----------

  return (
    <section className="admin-app-root">
      <h1 className="admin-h1">Applications</h1>
      <p className="admin-subtitle">
        Review applications, set their status, and connect them to buyers and puppies.
      </p>

      {message && <div className="admin-banner">{message}</div>}

      <div className="admin-app-toolbar">
        <input
          className="admin-input"
          placeholder="Search applications (name, email, phone, notes)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="admin-toolbar-count">
          {loading ? "Loading…" : `${filteredApps.length} application(s)`}
        </span>
      </div>

      <div className="admin-app-layout">
        {/* LEFT: LIST */}
        <div className="admin-card admin-app-list">
          <div className="admin-app-list-header">
            <span>Applications</span>
          </div>

          {filteredApps.length === 0 && !loading && (
            <div className="admin-empty">No applications found.</div>
          )}

          <div className="admin-app-list-body">
            {filteredApps.map((app: any) => {
              const active = String(app.id) === String(selectedId);
              return (
                <button
                  key={app.id}
                  type="button"
                  className={`admin-app-row ${active ? "is-active" : ""}`}
                  onClick={() => {
                    setSelectedId(String(app.id));
                    // sync dropdown selections to whatever is already stored
                    setBuyerChoice(app.buyer_id ? String(app.buyer_id) : "");
                    setPuppyChoice(app.puppy_id ? String(app.puppy_id) : "");
                    setMessage("");
                  }}
                >
                  <div className="admin-app-row-main">
                    <div className="admin-app-row-name">{appDisplayName(app)}</div>
                    <div className="admin-app-row-meta">
                      <span>{app.email || app.applicant_email}</span>
                      {appCreated(app) && (
                        <span className="dot-sep">{appCreated(app)}</span>
                      )}
                    </div>
                  </div>
                  <span className={`admin-status-pill status-${appStatus(app)}`}>
                    {appStatus(app)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: DETAIL */}
        <div className="admin-card admin-app-detail">
          {!selectedApp && (
            <div className="admin-empty">
              Select an application on the left to review details.
            </div>
          )}

          {selectedApp && (
            <div className="admin-app-detail-inner">
              <header className="admin-app-detail-header">
                <div>
                  <div className="admin-app-detail-name">
                    {appDisplayName(selectedApp)}
                  </div>
                  <div className="admin-app-detail-sub">
                    {selectedApp.email || selectedApp.applicant_email}{" "}
                    {selectedApp.phone || selectedApp.applicant_phone
                      ? " · " + (selectedApp.phone || selectedApp.applicant_phone)
                      : ""}
                  </div>
                </div>
                <span className={`admin-status-pill status-${appStatus(selectedApp)}`}>
                  {appStatus(selectedApp)}
                </span>
              </header>

              <section className="admin-app-section">
                <div className="admin-app-section-title">Status</div>
                <div className="admin-app-status-buttons">
                  <button
                    type="button"
                    className="btn-pill"
                    disabled={savingStatus}
                    onClick={() => handleStatusChange("approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-pill"
                    disabled={savingStatus}
                    onClick={() => handleStatusChange("waitlist")}
                  >
                    Waitlist
                  </button>
                  <button
                    type="button"
                    className="btn-pill btn-danger"
                    disabled={savingStatus}
                    onClick={() => handleStatusChange("denied")}
                  >
                    Deny
                  </button>
                </div>
              </section>

              <section className="admin-app-section">
                <div className="admin-app-section-title">Assignment</div>
                <div className="admin-form-grid">
                  <div className="admin-form-field">
                    <label>Buyer</label>
                    <select
                      className="admin-select"
                      value={buyerChoice}
                      onChange={(e) => setBuyerChoice(e.target.value)}
                    >
                      <option value="">— No buyer selected —</option>
                      <option value="__create__">
                        Create buyer from this application
                      </option>
                      {buyers.map((b: any) => (
                        <option key={b.id} value={String(b.id)}>
                          {buyerDisplay(b)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-field">
                    <label>Puppy</label>
                    <select
                      className="admin-select"
                      value={puppyChoice}
                      onChange={(e) => setPuppyChoice(e.target.value)}
                    >
                      <option value="">— No puppy selected —</option>
                      {puppies.map((p: any) => (
                        <option key={p.id} value={String(p.id)}>
                          {puppyDisplay(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-pill btn-primary"
                  disabled={savingAssignment}
                  onClick={handleSaveAssignment}
                >
                  {savingAssignment ? "Saving…" : "Save Assignment"}
                </button>

                <div className="admin-app-assignment-meta">
                  {selectedApp.buyer_id && (
                    <div>
                      Linked buyer ID: <code>{selectedApp.buyer_id}</code>
                    </div>
                  )}
                  {selectedApp.puppy_id && (
                    <div>
                      Linked puppy ID: <code>{selectedApp.puppy_id}</code>
                    </div>
                  )}
                </div>
              </section>

              <section className="admin-app-section">
                <div className="admin-app-section-title">Application Data</div>
                <pre className="admin-json">
                  {JSON.stringify(selectedApp, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-app-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-banner {
          padding: 8px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: #e5e7eb;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.35);
          max-width: 520px;
        }

        .admin-app-toolbar {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }

        .admin-input {
          flex: 1;
          border-radius: 999px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #f9fafb;
          padding: 7px 11px;
          font-size: 13px;
        }

        .admin-input:focus {
          outline: none;
          border-color: #e0a96d;
          box-shadow: 0 0 0 2px rgba(224, 169, 109, 0.3);
        }

        .admin-select {
          border-radius: 999px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #e5e7eb;
          padding: 7px 11px;
          font-size: 13px;
        }

        .admin-toolbar-count {
          font-size: 12px;
          color: #9ca3af;
          white-space: nowrap;
        }

        .admin-app-layout {
          display: grid;
          grid-template-columns: minmax(0, 2.1fr) minmax(0, 3fr);
          gap: 18px;
        }

        @media (max-width: 1100px) {
          .admin-app-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .admin-card {
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.95);
          background: radial-gradient(
              140% 200% at 0% 0%,
              rgba(15, 23, 42, 0.9),
              #020617
            );
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.9);
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .admin-app-list-header {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #e5e7eb;
        }

        .admin-app-list-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
          overflow-y: auto;
          max-height: 520px;
        }

        .admin-app-row {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #111827;
          background: #020617;
          padding: 8px 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          text-align: left;
        }

        .admin-app-row:hover {
          border-color: #1f2937;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.7);
        }

        .admin-app-row.is-active {
          border-color: #e0a96d;
          box-shadow: 0 0 0 1px rgba(224, 169, 109, 0.8),
            0 16px 32px rgba(0, 0, 0, 0.8);
        }

        .admin-app-row-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-app-row-name {
          font-size: 13px;
          font-weight: 600;
        }

        .admin-app-row-meta {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .dot-sep::before {
          content: "• ";
        }

        .admin-status-pill {
          border-radius: 999px;
          padding: 3px 9px;
          font-size: 11px;
          text-transform: capitalize;
          border: 1px solid #1f2937;
        }

        .status-pending {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.45);
        }

        .status-approved {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.45);
        }

        .status-waitlist {
          background: rgba(234, 179, 8, 0.12);
          border-color: rgba(234, 179, 8, 0.45);
        }

        .status-denied {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.45);
        }

        .admin-empty {
          font-size: 13px;
          color: #9ca3af;
          padding: 10px 6px;
        }

        .admin-app-detail {
          min-height: 320px;
        }

        .admin-app-detail-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-app-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .admin-app-detail-name {
          font-size: 18px;
          font-weight: 600;
        }

        .admin-app-detail-sub {
          font-size: 12px;
          color: #9ca3af;
        }

        .admin-app-section {
          border-top: 1px solid rgba(15, 23, 42, 0.9);
          padding-top: 10px;
          margin-top: 6px;
        }

        .admin-app-section-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #e5e7eb;
        }

        .admin-app-status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .btn-pill {
          border-radius: 999px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #e5e7eb;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-pill:hover:enabled {
          border-color: #e0a96d;
        }

        .btn-primary {
          margin-top: 8px;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          border-color: transparent;
          color: #111827;
        }

        .btn-danger {
          border-color: rgba(239, 68, 68, 0.7);
          color: #fecaca;
        }

        .admin-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 4px;
        }

        @media (max-width: 640px) {
          .admin-form-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .admin-form-field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .admin-form-field label {
          font-size: 12px;
          color: #e5e7eb;
        }

        .admin-app-assignment-meta {
          margin-top: 6px;
          font-size: 11px;
          color: #9ca3af;
        }

        .admin-json {
          margin: 6px 0 0;
          max-height: 220px;
          overflow: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 11px;
          background: #020617;
          border-radius: 10px;
          border: 1px solid #111827;
          padding: 8px 10px;
        }
      `}</style>
    </section>
  );
}
