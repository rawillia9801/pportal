// src/app/profile/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-14: New Profile page
                 • Loads logged-in user from Supabase
                 • Reads/writes contact info in `profiles`
                 • Field for Puppy Name (display name)
                 • Light, friendly layout to match dashboard
   ============================================ */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type ProfileForm = {
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  puppy_name: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [email, setEmail] = useState<string>("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    puppy_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setMessage(null);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!cancelled) router.replace("/login");
          return;
        }

        if (!cancelled) {
          setEmail(user.email || "");
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "full_name, phone, address_line1, city, state, postal_code, puppy_name"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (!cancelled && data) {
          setForm({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            address_line1: data.address_line1 ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            postal_code: data.postal_code ?? "",
            puppy_name: data.puppy_name ?? "",
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Unable to load your profile right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  function updateField<K extends keyof ProfileForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const payload = {
        id: user.id,
        full_name: form.full_name || null,
        phone: form.phone || null,
        address_line1: form.address_line1 || null,
        city: form.city || null,
        state: form.state || null,
        postal_code: form.postal_code || null,
        puppy_name: form.puppy_name || null,
      };

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) throw upsertError;

      setMessage("Your profile has been updated.");
    } catch (e: any) {
      setError(e?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="shell">
      <div className="card">
        <header className="header">
          <div>
            <h1>Profile</h1>
            <p>Update your contact information and your puppy’s display name.</p>
          </div>
          {email && <div className="email">{email}</div>}
        </header>

        {loading ? (
          <p className="muted">Loading your profile…</p>
        ) : (
          <form onSubmit={handleSave} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-ok">{message}</div>}

            <div className="grid">
              <div className="field">
                <label>Full Name</label>
                <input
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="First Last"
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
              </div>

              <div className="field">
                <label>Street Address</label>
                <input
                  value={form.address_line1}
                  onChange={(e) =>
                    updateField("address_line1", e.target.value)
                  }
                  placeholder="123 Main St"
                  autoComplete="street-address"
                />
              </div>

              <div className="field">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City"
                  autoComplete="address-level2"
                />
              </div>

              <div className="field">
                <label>State</label>
                <input
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="VA"
                  autoComplete="address-level1"
                />
              </div>

              <div className="field">
                <label>ZIP Code</label>
                <input
                  value={form.postal_code}
                  onChange={(e) =>
                    updateField("postal_code", e.target.value)
                  }
                  placeholder="12345"
                  autoComplete="postal-code"
                />
              </div>

              <div className="field full">
                <label>Puppy Name</label>
                <input
                  value={form.puppy_name}
                  onChange={(e) => updateField("puppy_name", e.target.value)}
                  placeholder="Your puppy’s call name (e.g., Gizmo)"
                />
                <p className="hint">
                  This is the name we’ll reference in messages and notes about
                  your puppy.
                </p>
              </div>
            </div>

            <button className="saveBtn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        )}
      </div>

      {/* Light theme to match dashboard */}
      <style jsx global>{`
        :root {
          --ink: #1e232d;
          --muted: #6b7280;
          --bg-grad-a: #f7f9ff;
          --bg-grad-b: #eef3ff;
          --bg-grad-c: #e9f6ff;
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(37, 99, 235, 0.16);
          --accent: #5a6cff;
          --accent-ink: #28306b;
        }
      `}</style>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(
            180deg,
            var(--bg-grad-a),
            var(--bg-grad-b) 40%,
            var(--bg-grad-c)
          );
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .card {
          width: 100%;
          max-width: 720px;
          border-radius: 20px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
          padding: 20px 22px 22px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .header h1 {
          margin: 0 0 4px;
          font-size: 1.4rem;
        }

        .header p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .email {
          font-size: 0.82rem;
          color: var(--muted);
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--panel-border);
          background: #f9fafb;
        }

        .muted {
          color: var(--muted);
          font-size: 0.9rem;
          margin: 8px 0 0;
        }

        .form {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 0.9rem;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #4b5563;
        }

        input {
          border-radius: 10px;
          border: 1px solid var(--panel-border);
          padding: 7px 9px;
          font-size: 0.9rem;
          outline: none;
        }

        input:focus {
          border-color: var(--panel-ring);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .hint {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: var(--muted);
        }

        .saveBtn {
          align-self: flex-start;
          border-radius: 999px;
          border: 1px solid transparent;
          padding: 8px 16px;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.08s ease, box-shadow 0.12s ease;
          margin-top: 4px;
        }

        .saveBtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.18);
        }

        .saveBtn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .alert {
          border-radius: 10px;
          padding: 7px 9px;
          font-size: 0.82rem;
        }

        .alert-error {
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: #fef2f2;
          color: #991b1b;
        }

        .alert-ok {
          border: 1px solid rgba(22, 163, 74, 0.35);
          background: #ecfdf3;
          color: #166534;
        }

        @media (max-width: 720px) {
          .shell {
            padding: 16px;
          }
          .card {
            padding: 18px 16px 20px;
          }
          .grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
