// src/app/admin/puppies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "rawillia9809@gmail.com";

type Status = "Available" | "Reserved" | "Sold";
type Gender = "Male" | "Female";
type Registry = "AKC" | "CKC" | "ACA" | "";

type PupForm = {
  name: string;
  price: string;           // keep as string for input; convert on submit
  gender: Gender | "";     // restrict to allowed values; "" until chosen
  registry: Registry;      // AKC/CKC/ACA or empty
  status: Status;
  dob: string;             // YYYY-MM-DD
  ready_date: string;      // YYYY-MM-DD
  photo: string;           // single URL; wrapped to array on submit
};

export default function AdminPuppiesPage() {
  const r = useRouter();
  const supabase = getBrowserClient();

  const [me, setMe] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [f, setF] = useState<PupForm>({
    name: "",
    price: "",
    gender: "",
    registry: "",
    status: "Available",
    dob: "",
    ready_date: "",
    photo: "",
  });

  // Simple admin gate: only your email can use this page
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setMe(email);
      if (!email) {
        r.replace("/login");
        return;
      }
      if (email.toLowerCase() !== ADMIN_EMAIL) {
        setBlocked(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked || saving) return;

    setMsg(null);
    setSaving(true);
    try {
      // price -> number | null
      const priceNum =
        f.price.trim() === ""
          ? null
          : Number.isFinite(Number(f.price))
          ? Number(f.price)
          : null;

      // photos must NEVER be null if column is NOT NULL
      const photos = f.photo.trim() ? [f.photo.trim()] : [];

      // Enforce allowed enums to satisfy CHECK constraints
      const gender: Gender =
        f.gender === "Male" || f.gender === "Female" ? f.gender : "Male";
      const status: Status =
        f.status === "Available" || f.status === "Reserved" || f.status === "Sold"
          ? f.status
          : "Available";

      // Optional registry
      const registry: Registry =
        f.registry === "AKC" || f.registry === "CKC" || f.registry === "ACA"
          ? f.registry
          : "";

      const insertRow = {
        name: f.name || null,
        price: priceNum,
        gender,                      // ✅ matches CHECK constraint
        registry: registry || null,  // allow null in DB if column is nullable
        status,                      // ✅ matches CHECK constraint
        dob: f.dob || null,
        ready_date: f.ready_date || null,
        photos,                      // ✅ array, never null
        // created_at handled by DB default if present
      };

      const { error } = await supabase.from("puppies").insert([insertRow]);
      if (error) throw error;

      setMsg("Saved. Redirecting to Available Puppies…");
      setTimeout(() => r.replace("/puppies"), 700);
    } catch (err: any) {
      setMsg(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (blocked) {
    return (
      <main style={{ maxWidth: 800, margin: "48px auto", padding: 24 }}>
        <h1>Admin · Puppies</h1>
        <p style={{ color: "#a00" }}>Your account does not have access to this page.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: "48px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Admin · Add Puppy</h1>
      <p style={{ color: "#666", marginBottom: 18 }}>Signed in as: {me ?? "—"}</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Field label="Name">
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </Field>

        <Field label="Price (USD)">
          <input
            inputMode="decimal"
            value={f.price}
            onChange={(e) => setF({ ...f, price: e.target.value })}
            placeholder="1800"
          />
        </Field>

        <Field label="Gender">
          <select
            required
            value={f.gender}
            onChange={(e) => setF({ ...f, gender: e.target.value as Gender | "" })}
          >
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </Field>

        <Field label="Registry">
          <select
            value={f.registry}
            onChange={(e) =>
              setF({ ...f, registry: e.target.value as Registry })
            }
          >
            <option value="">(none)</option>
            <option value="AKC">AKC</option>
            <option value="CKC">CKC</option>
            <option value="ACA">ACA</option>
          </select>
        </Field>

        <Field label="Status">
          <select
            required
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as Status })}
          >
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>
        </Field>

        <Field label="DOB">
          <input
            type="date"
            value={f.dob}
            onChange={(e) => setF({ ...f, dob: e.target.value })}
          />
        </Field>

        <Field label="Ready Date">
          <input
            type="date"
            value={f.ready_date}
            onChange={(e) => setF({ ...f, ready_date: e.target.value })}
          />
        </Field>

        <Field label="Photo URL">
          <input
            // If your DB requires at least one photo, keep this required.
            // If it only requires NOT NULL, you can remove required (we send [] when blank).
            required
            value={f.photo}
            onChange={(e) => setF({ ...f, photo: e.target.value })}
            placeholder="https://…"
          />
        </Field>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button disabled={saving} type="submit" style={btnPrimary}>
            {saving ? "Saving…" : "Save Puppy"}
          </button>
          <button type="button" onClick={() => r.back()} style={btnGhost}>
            Cancel
          </button>
        </div>

        {msg && (
          <p style={{ marginTop: 8, color: msg.includes("Saved") ? "#0a7" : "#a00" }}>
            {msg}
          </p>
        )}
      </form>
    </main>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 14, color: "#444" }}>{props.label}</span>
      <div style={{ display: "grid" }}>{props.children}</div>
      <style jsx>{`
        input,
        select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
          outline: none;
        }
        input:focus,
        select:focus {
          border-color: #999;
        }
      `}</style>
    </label>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #bbb",
  background: "#fff",
  color: "#111",
};
