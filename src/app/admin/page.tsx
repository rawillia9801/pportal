"use client";

/* ============================================
   ADMIN DASHBOARD (LIGHT THEME)
   - 2025-11-15: New unified admin shell
     • Light / white panels (matches /dashboard)
     • Left sidebar with tab buttons
     • Live list views for Puppies, Litters,
       Applications, Messages, Transport
     • Breeding Program tab with:
         - list of breeding_dogs
         - add dog form (name + sex)
         - delete dog
   ============================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type AdminTab =
  | "overview"
  | "puppies"
  | "litters"
  | "applications"
  | "messages"
  | "transport"
  | "breeding";

type BreedingDog = {
  id: string;
  name: string | null;
  sex: string | null;
  registry?: string | null;
  origin?: string | null;
  dob?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Breeding dogs state
  const [breedingDogs, setBreedingDogs] = useState<BreedingDog[]>([]);
  const [dogsLoading, setDogsLoading] = useState(false);
  const [dogsError, setDogsError] = useState<string | null>(null);

  const [dogName, setDogName] = useState("");
  const [dogSex, setDogSex] = useState<"" | "male" | "female">("");
  const [savingDog, setSavingDog] = useState(false);

  useEffect(() => {
    if (activeTab === "breeding") {
      void loadBreedingDogs();
    }
  }, [activeTab]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function loadBreedingDogs() {
    setDogsLoading(true);
    setDogsError(null);
    const { data, error } = await supabase
      .from("breeding_dogs")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setDogsError(error.message);
    } else {
      setBreedingDogs((data ?? []) as BreedingDog[]);
    }
    setDogsLoading(false);
  }

  async function handleAddDog(e: React.FormEvent) {
    e.preventDefault();
    setDogsError(null);

    if (!dogName.trim() || !dogSex) {
      setDogsError("Please enter a name and select sex.");
      return;
    }

    setSavingDog(true);
    const { error } = await supabase
      .from("breeding_dogs")
      .insert([{ name: dogName.trim(), sex: dogSex }]);

    if (error) {
      console.error(error);
      setDogsError(error.message);
      setSavingDog(false);
      return;
    }

    setDogName("");
    setDogSex("");
    setSavingDog(false);
    await loadBreedingDogs();
  }

  async function handleDeleteDog(id: string) {
    const ok = window.confirm(
      "Remove this breeding dog from the program? This does not delete litters or puppies; it only removes the record from the breeding program list."
    );
    if (!ok) return;

    const { error } = await supabase
      .from("breeding_dogs")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setBreedingDogs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            <span className="paw-dot" />
            <span className="paw-dot" />
            <span className="paw-dot" />
          </div>
          <div className="brand-text">
            <div className="brand-line1">Admin Portal</div>
            <div className="brand-line2">Southwest Virginia Chihuahua</div>
          </div>
        </div>

        <nav className="nav">
          <AdminTabButton
            label="Overview"
            tab="overview"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <AdminTabButton
            label="Puppies"
            tab="puppies"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <AdminTabButton
            label="Litters"
            tab="litters"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <AdminTabButton
            label="Applications"
            tab="applications"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <AdminTabButton
            label="Messages"
            tab="messages"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <AdminTabButton
            label="Transport Requests"
            tab="transport"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <div className="nav-section-label">Breeding Program</div>
          <AdminTabButton
            label="Breeding Dogs"
            tab="breeding"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        </nav>

        <div className="sidebar-footer">
          <Link href="/dashboard" className="back-link">
            ← Back to customer view
          </Link>
          <button className="signout" type="button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="tagline">
              Manage puppies, litters, applications, messages, transport, and your
              breeding program from one central place.
            </p>
          </div>
        </header>

        {/* TAB CONTENT */}
        <section className="panel">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "puppies" && <PuppiesTab />}
          {activeTab === "litters" && <LittersTab />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "transport" && <TransportTab />}
          {activeTab === "breeding" && (
            <BreedingProgramTab
              dogs={breedingDogs}
              loading={dogsLoading}
              error={dogsError}
              dogName={dogName}
              dogSex={dogSex}
              savingDog={savingDog}
              onDogNameChange={setDogName}
              onDogSexChange={setDogSex}
              onAddDog={handleAddDog}
              onRefresh={loadBreedingDogs}
              onDeleteDog={handleDeleteDog}
            />
          )}
        </section>
      </main>

      {/* STYLES */}
      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: 100vh;
          background: #f3f4f6;
          color: #111827;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          padding: 20px 18px;
          border-right: 1px solid #e5e7eb;
          background: #ffffff;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 18px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-mark {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(135deg, #facc6b, #f97316);
          box-shadow: 0 6px 14px rgba(249, 115, 22, 0.35);
        }

        .paw-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #111827;
          opacity: 0.8;
        }
        .paw-dot:nth-child(1) {
          top: 9px;
          left: 11px;
        }
        .paw-dot:nth-child(2) {
          top: 9px;
          right: 10px;
        }
        .paw-dot:nth-child(3) {
          bottom: 9px;
          left: 17px;
        }

        .brand-text {
          line-height: 1.1;
        }
        .brand-line1 {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }
        .brand-line2 {
          font-size: 11px;
          color: #6b7280;
        }

        .nav {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-section-label {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .back-link {
          font-size: 12px;
          color: #4f46e5;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }

        .signout {
          margin-top: 2px;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid #f97373;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease;
        }

        .signout:hover {
          background: #fee2e2;
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        /* MAIN */
        .main {
          padding: 24px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .header h1 {
          margin: 0 0 4px;
          font-size: clamp(22px, 2.6vw, 28px);
        }

        .tagline {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
          max-width: 620px;
        }

        .panel {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 16px 16px 18px;
          box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          .main {
            padding: 18px 16px 22px;
          }
        }
      `}</style>
    </div>
  );
}

function AdminTabButton(props: {
  label: string;
  tab: AdminTab;
  activeTab: AdminTab;
  onClick: (tab: AdminTab) => void;
}) {
  const isActive = props.tab === props.activeTab;
  return (
    <>
      <button
        type="button"
        className={`tab-btn ${isActive ? "tab-btn-active" : ""}`}
        onClick={() => props.onClick(props.tab)}
      >
        {props.label}
      </button>
      <style jsx>{`
        .tab-btn {
          width: 100%;
          text-align: left;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #111827;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease, box-shadow 0.12s ease;
        }
        .tab-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .tab-btn-active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4338ca;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
      `}</style>
    </>
  );
}

/* ============ OVERVIEW TAB ============ */

function OverviewTab() {
  return (
    <div className="tab-inner">
      <h2>Overview</h2>
      <p>
        Use the tabs on the left to manage puppies, litters, applications,
        messages, transport requests, and your breeding program.
      </p>
      <p>
        This page is intentionally simple so everything else can stay organized
        and easy to find.
      </p>
      <style jsx>{`
        .tab-inner h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }
        .tab-inner p {
          margin: 0 0 8px;
          font-size: 14px;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}

/* ============ PUPPIES TAB ============ */

function PuppiesTab() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("puppies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Puppies</h2>
        <button className="small-btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        This list is pulled directly from the <code>puppies</code> table in
        Supabase. You can extend this later with full edit forms.
      </p>

      {loading && <div className="hint">Loading puppies…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="hint">No puppies found yet.</div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table">
          <div className="thead">
            <span>Name</span>
            <span>Status</span>
            <span>Sex</span>
            <span>Price</span>
          </div>
          {rows.map((row) => {
            const name =
              row.name ||
              row.call_name ||
              row.puppy_name ||
              `Puppy ${row.id?.slice(0, 6) ?? ""}`;
            const status =
              row.status ||
              row.puppy_status ||
              row.state ||
              "N/A";
            const sex = row.sex || row.gender || "N/A";
            const price =
              typeof row.price === "number"
                ? `$${row.price.toFixed(2)}`
                : typeof row.total_price === "number"
                ? `$${row.total_price.toFixed(2)}`
                : "N/A";

            return (
              <div className="trow" key={row.id}>
                <span>{name}</span>
                <span>{status}</span>
                <span>{sex}</span>
                <span>{price}</span>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .table {
          margin-top: 6px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-size: 13px;
        }
        .thead,
        .trow {
          display: grid;
          grid-template-columns: 1.8fr 1fr 0.8fr 1fr;
          gap: 6px;
          padding: 8px 10px;
        }
        .thead {
          background: #f3f4f6;
          font-weight: 600;
        }
        .trow:nth-child(even) {
          background: #fafafa;
        }
        .trow:nth-child(odd) {
          background: #ffffff;
        }
        .small-btn {
          padding: 5px 9px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          cursor: pointer;
        }
        .small-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ============ LITTERS TAB ============ */

function LittersTab() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("litters")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Litters</h2>
        <button className="small-btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        Shows rows from the <code>litters</code> table. You can extend this to
        manage themes, parents, and puppy counts.
      </p>

      {loading && <div className="hint">Loading litters…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="hint">No litters found yet.</div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table">
          <div className="thead">
            <span>Name / Theme</span>
            <span>Date Whelped</span>
            <span>Sire</span>
            <span>Dam</span>
          </div>
          {rows.map((row) => (
            <div className="trow" key={row.id}>
              <span>{row.name || row.theme || "N/A"}</span>
              <span>{row.date_whelped || row.dob || "N/A"}</span>
              <span>{row.sire_name || row.sire || "N/A"}</span>
              <span>{row.dam_name || row.dam || "N/A"}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .table {
          margin-top: 6px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-size: 13px;
        }
        .thead,
        .trow {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 6px;
          padding: 8px 10px;
        }
        .thead {
          background: #f3f4f6;
          font-weight: 600;
        }
        .trow:nth-child(even) {
          background: #fafafa;
        }
        .trow:nth-child(odd) {
          background: #ffffff;
        }
        .small-btn {
          padding: 5px 9px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          cursor: pointer;
        }
        .small-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ============ APPLICATIONS TAB ============ */

function ApplicationsTab() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Applications</h2>
        <button className="small-btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        Basic view of the <code>applications</code> table. Later you can add
        approve / deny / assign puppy controls on this screen.
      </p>

      {loading && <div className="hint">Loading applications…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="hint">No applications found yet.</div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table">
          <div className="thead">
            <span>Applicant</span>
            <span>Email</span>
            <span>Status</span>
            <span>Created</span>
          </div>
          {rows.map((row) => (
            <div className="trow" key={row.id}>
              <span>
                {row.full_name ||
                  row.applicant_name ||
                  row.name ||
                  "N/A"}
              </span>
              <span>{row.email || row.contact_email || "N/A"}</span>
              <span>{row.status || row.application_status || "N/A"}</span>
              <span>{row.created_at || "N/A"}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .table {
          margin-top: 6px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-size: 13px;
        }
        .thead,
        .trow {
          display: grid;
          grid-template-columns: 1.4fr 1.4fr 1fr 1.2fr;
          gap: 6px;
          padding: 8px 10px;
        }
        .thead {
          background: #f3f4f6;
          font-weight: 600;
        }
        .trow:nth-child(even) {
          background: #fafafa;
        }
        .trow:nth-child(odd) {
          background: #ffffff;
        }
        .small-btn {
          padding: 5px 9px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          cursor: pointer;
        }
        .small-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ============ MESSAGES TAB ============ */

function MessagesTab() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Messages</h2>
        <button className="small-btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        Shows messages from the <code>messages</code> table. Later you can add
        full conversation views and reply forms here.
      </p>

      {loading && <div className="hint">Loading messages…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="hint">No messages yet.</div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table">
          <div className="thead">
            <span>From</span>
            <span>Subject</span>
            <span>Created</span>
          </div>
          {rows.map((row) => (
            <div className="trow" key={row.id}>
              <span>{row.from_email || row.sender || "N/A"}</span>
              <span>
                {row.subject ||
                  row.title ||
                  (row.body || row.content || "").slice(0, 40) ||
                  "Message"}
              </span>
              <span>{row.created_at || "N/A"}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .table {
          margin-top: 6px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-size: 13px;
        }
        .thead,
        .trow {
          display: grid;
          grid-template-columns: 1.2fr 2fr 1.2fr;
          gap: 6px;
          padding: 8px 10px;
        }
        .thead {
          background: #f3f4f6;
          font-weight: 600;
        }
        .trow:nth-child(even) {
          background: #fafafa;
        }
        .trow:nth-child(odd) {
          background: #ffffff;
        }
        .small-btn {
          padding: 5px 9px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          cursor: pointer;
        }
        .small-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ============ TRANSPORT TAB ============ */

function TransportTab() {
  const supabase = getBrowserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("transport_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Transport Requests</h2>
        <button className="small-btn" type="button" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        Basic list of the <code>transport_requests</code> table. Later you can
        wire in approvals, denials, fees, and credits.
      </p>

      {loading && <div className="hint">Loading transport requests…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div className="hint">No transport requests yet.</div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="table">
          <div className="thead">
            <span>Buyer</span>
            <span>Route</span>
            <span>Status</span>
            <span>Created</span>
          </div>
          {rows.map((row) => (
            <div className="trow" key={row.id}>
              <span>{row.buyer_name || row.name || "N/A"}</span>
              <span>
                {row.from_city || row.from_location || "?"} →{" "}
                {row.to_city || row.to_location || "?"}
              </span>
              <span>{row.status || "N/A"}</span>
              <span>{row.created_at || "N/A"}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .table {
          margin-top: 6px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          font-size: 13px;
        }
        .thead,
        .trow {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr 1fr 1.2fr;
          gap: 6px;
          padding: 8px 10px;
        }
        .thead {
          background: #f3f4f6;
          font-weight: 600;
        }
        .trow:nth-child(even) {
          background: #fafafa;
        }
        .trow:nth-child(odd) {
          background: #ffffff;
        }
        .small-btn {
          padding: 5px 9px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          cursor: pointer;
        }
        .small-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ============ BREEDING PROGRAM TAB ============ */

function BreedingProgramTab(props: {
  dogs: BreedingDog[];
  loading: boolean;
  error: string | null;
  dogName: string;
  dogSex: "" | "male" | "female";
  savingDog: boolean;
  onDogNameChange: (v: string) => void;
  onDogSexChange: (v: "" | "male" | "female") => void;
  onAddDog: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onDeleteDog: (id: string) => void;
}) {
  return (
    <div className="tab-inner">
      <div className="tab-header">
        <h2>Breeding Program Dogs</h2>
        <button className="small-btn" type="button" onClick={props.onRefresh}>
          Refresh
        </button>
      </div>
      <p className="tab-text">
        This section reads from the <code>breeding_dogs</code> table. From here
        you can add dogs to your program and remove them if they&apos;re
        retired. Later we can link each dog to litters, puppies, and sales.
      </p>

      {/* Add dog form */}
      <form className="dog-form" onSubmit={props.onAddDog}>
        <div className="dog-form-row">
          <div className="field">
            <label>Name</label>
            <input
              value={props.dogName}
              onChange={(e) => props.onDogNameChange(e.target.value)}
              placeholder="Dog's registered or call name"
              required
            />
          </div>
          <div className="field">
            <label>Sex</label>
            <select
              value={props.dogSex}
              onChange={(e) =>
                props.onDogSexChange(e.target.value as "" | "male" | "female")
              }
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button className="primary-btn" type="submit" disabled={props.savingDog}>
          {props.savingDog ? "Saving…" : "Add to Breeding Program"}
        </button>
      </form>

      {props.loading && <div className="hint">Loading breeding dogs…</div>}
      {props.error && <div className="error">Error: {props.error}</div>}

      {!props.loading && !props.error && props.dogs.length === 0 && (
        <div className="hint">
          No breeding dogs yet. Add your first sire or dam above.
        </div>
      )}

      {!props.loading && !props.error && props.dogs.length > 0 && (
        <div className="dog-grid">
          {props.dogs.map((dog) => (
            <article className="dog-card" key={dog.id}>
              <div className="dog-header">
                <h3>{dog.name || "Unnamed dog"}</h3>
                <span className="dog-pill">
                  {(dog.sex || "N/A").toString().toUpperCase()}
                </span>
              </div>
              <dl className="dog-meta">
                <div>
                  <dt>Registry</dt>
                  <dd>{dog.registry || "—"}</dd>
                </div>
                <div>
                  <dt>Origin</dt>
                  <dd>{dog.origin || "—"}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>{dog.dob || "—"}</dd>
                </div>
              </dl>
              <div className="dog-footer">
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => props.onDeleteDog(dog.id)}
                >
                  Remove from program
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .tab-inner {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .tab-text {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }
        .hint {
          font-size: 13px;
          color: #6b7280;
        }
        .error {
          font-size: 13px;
          color: #b91c1c;
        }
        .dog-form {
          margin-top: 4px;
          padding: 10px 10px 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dog-form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .field {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .field label {
          font-size: 12px;
          color: #6b7280;
        }
        .field input,
        .field select {
          border-radius: 8px;
          border: 1px solid #d1d5db;
          padding: 7px 9px;
          font-size: 13px;
        }
        .field input:focus,
        .field select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.18);
        }
        .primary-btn {
          align-self: flex-start;
          margin-top: 2px;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid #4f46e5;
          background: #4f46e5;
          color: #ffffff;
          font-size: 13px;
          cursor: pointer;
        }
        .primary-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .dog-grid {
          margin-top: 4px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 12px;
        }
        .dog-card {
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 10px 11px 10px;
          background: #ffffff;
          box-shadow: 0 10px 16px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .dog-header h3 {
          margin: 0;
          font-size: 15px;
        }
        .dog-pill {
          font-size: 10px;
          border-radius: 999px;
          padding: 3px 7px;
          background: #eef2ff;
          color: #4338ca;
          border: 1px solid #c7d2fe;
        }
        .dog-meta {
          margin: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          font-size: 11px;
        }
        .dog-meta dt {
          font-weight: 600;
          color: #6b7280;
        }
        .dog-meta dd {
          margin: 0;
          color: #111827;
        }
        .dog-footer {
          margin-top: 4px;
          display: flex;
          justify-content: flex-end;
        }
        .danger-btn {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #f97373;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
          cursor: pointer;
        }
        .danger-btn:hover {
          background: #fee2e2;
          border-color: #ef4444;
        }
      `}</style>
    </div>
  );
}
