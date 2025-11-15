// src/app/profile/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-14: New Profile page
                 • Loads logged-in user's profile
                 • Lets user update contact info
                   and their puppy's name
   ============================================ */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type ProfileState = {
  userId: string | null;
  fullName: string;
  phone: string;
  address: string;
  puppyName: string;
  loading: boolean;
  saving: boolean;
  message: string;
  error: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [state, setState] = useState<ProfileState>({
    userId: null,
    fullName: "",
    phone: "",
    address: "",
    puppyName: "",
    loading: true,
    saving: false,
    message: "",
    error: "",
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    try {
      setState((s) => ({ ...s, loading: true, message: "", error: "" }));

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address, puppy_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows (safe to ignore)
        throw error;
      }

      setState((s) => ({
        ...s,
        userId: user.id,
        fullName: data?.full_name ?? "",
        phone: data?.phone ?? "",
        address: data?.address ?? "",
        puppyName: data?.puppy_name ?? "",
        loading: false,
      }));
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          err?.message ||
          "We couldn't load your profile right now. Please try again.",
      }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!state.userId) return;

    try {
      setState((s) => ({
        ...s,
        saving: true,
        message: "",
        error: "",
      }));

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: state.userId,
            full_name: state.fullName.trim(),
            phone: state.phone.trim(),
            address: state.address.trim(),
            puppy_name: state.puppyName.trim(),
          },
          { onConflict: "id" }
        );

      if (error) {
        throw error;
      }

      setState((s) => ({
        ...s,
        saving: false,
        message: "Your profile has been updated.",
      }));
    } catch (err: any) {
      setState((s) => ({
        ...s,
        saving: false,
        error:
          err?.message ||
          "We couldn't save your changes right now. Please try again.",
      }));
    }
  }

  function updateField<K extends keyof ProfileState>(key: K, value: any) {
    setState((s) => ({ ...s, [key]: value }));
  }

  return (
    <main>
      <div className="shell">
        <section className="card">
          <header className="header">
            <h1>My Profile</h1>
            <p>
              Keep your contact information and your puppy&apos;s name up to
              date so we can reach you quickly when there are updates.
            </p>
          </header>

          {state.loading ? (
            <div className="statusRow">Loading your profile…</div>
          ) : (
            <form onSubmit={handleSave} className="form">
              {state.error && (
                <div className="alert error">{state.error}</div>
              )}
              {state.message && (
                <div className="alert success">{state.message}</div>
              )}

              <div className="fieldGroup">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={state.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="First and Last Name"
                  autoComplete="name"
                />
              </div>

              <div className="fieldGroup">
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={state.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Best number to reach you"
                  autoComplete="tel"
                />
              </div>

              <div className="fieldGroup">
                <label className="label">Mailing Address</label>
                <textarea
                  rows={3}
                  value={state.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Street, City, State, ZIP"
                />
              </div>

              <div className="fieldGroup">
                <label className="label">Puppy&apos;s Name</label>
                <input
                  type="text"
                  value={state.puppyName}
                  onChange={(e) => updateField("puppyName", e.target.value)}
                  placeholder="What would you like your puppy to be called?"
                />
                <p className="hint">
                  This helps us personalize your updates (for example:
                  “Gizmo&apos;s weight chart has been updated”).
                </p>
              </div>

              <div className="actions">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={state.saving}
                >
                  {state.saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <style jsx>{`
        :root {
          --bg: #020617;
          --panelBorder: #1f2937;
          --ink: #f9fafb;
          --muted: #d1d5db;
          --brand: #e0a96d;
          --brandAlt: #c47a35;
        }

        main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background:
            radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),
            radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),
            #020617;
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .shell {
          width: 100%;
          max-width: 720px;
        }

        .card {
          border-radius: 22px;
          border: 1px solid var(--panelBorder);
          background: #020617;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.85);
          padding: 18px 18px 20px;
        }

        .header h1 {
          margin: 0 0 6px;
          font-size: 22px;
        }

        .header p {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        .statusRow {
          margin-top: 16px;
          font-size: 14px;
          color: var(--muted);
        }

        .form {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fieldGroup {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 13px;
          font-weight: 500;
        }

        input,
        textarea {
          border-radius: 10px;
          border: 1px solid #374151;
          background: #020617;
          color: var(--ink);
          padding: 8px 10px;
          font-size: 13px;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 2px rgba(224, 169, 109, 0.25);
        }

        .hint {
          margin: 0;
          font-size: 11px;
          color: var(--muted);
        }

        .actions {
          margin-top: 6px;
          display: flex;
          justify-content: flex-end;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid #374151;
          background: #020617;
          color: var(--ink);
        }

        .btn.primary {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          border-color: transparent;
        }

        .btn.primary:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .alert {
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .alert.error {
          border: 1px solid #fecaca;
          background: #7f1d1d;
          color: #fee2e2;
        }

        .alert.success {
          border: 1px solid #bbf7d0;
          background: #14532d;
          color: #dcfce7;
        }

        @media (max-width: 640px) {
          .card {
            padding: 16px 14px 18px;
          }
        }
      `}</style>
    </main>
  );
}
