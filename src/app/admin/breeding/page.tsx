"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

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

export default function BreedingProgramPage() {
  const supabase = getBrowserClient();

  const [dogs, setDogs] = useState<BreedingDog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [dogName, setDogName] = useState("");
  const [dogSex, setDogSex] = useState<"" | "male" | "female">("");
  const [savingDog, setSavingDog] = useState(false);

  useEffect(() => {
    void loadDogs();
  }, []);

  async function loadDogs() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("breeding_dogs")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setErr(error.message);
    } else {
      setDogs((data ?? []) as BreedingDog[]);
    }
    setLoading(false);
  }

  async function handleAddDog(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!dogName.trim() || !dogSex) {
      setErr("Please enter a name and select sex.");
      return;
    }

    setSavingDog(true);
    const { error } = await supabase.from("breeding_dogs").insert([
      {
        name: dogName.trim(),
        sex: dogSex, // must be 'male' or 'female' to satisfy your CHECK constraint
      },
    ]);

    if (error) {
      console.error(error);
      setErr(error.message);
      setSavingDog(false);
      return;
    }

    setDogName("");
    setDogSex("");
    setSavingDog(false);
    await loadDogs();
  }

  async function handleDeleteDog(id: string) {
    const ok = window.confirm(
      "Remove this breeding dog from the program? This does not delete litters or puppies; it only removes the dog from this list."
    );
    if (!ok) return;

    const { error } = await supabase.from("breeding_dogs").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setDogs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="tab-inner">
      <p className="lead">
        Keep a clean list of your sires and dams here. Later we can connect each
        dog to litters, puppies, and sales so you can see performance and income
        by dog and by year.
      </p>

      {/* Add dog form */}
      <form className="dog-form" onSubmit={handleAddDog}>
        <div className="dog-form-row">
          <div className="field">
            <label>Name</label>
            <input
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              placeholder="Dog's registered or call name"
              required
            />
          </div>
          <div className="field">
            <label>Sex</label>
            <select
              value={dogSex}
              onChange={(e) =>
                setDogSex(e.target.value as "" | "male" | "female")
              }
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button className="primary-btn" type="submit" disabled={savingDog}>
          {savingDog ? "Saving…" : "Add to Breeding Program"}
        </button>

        {err && <div className="error">Error: {err}</div>}
      </form>

      {loading && <div className="hint">Loading breeding dogs…</div>}

      {!loading && !err && dogs.length === 0 && (
        <div className="hint">
          No breeding dogs yet. Add your first sire or dam above.
        </div>
      )}

      {!loading && !err && dogs.length > 0 && (
        <div className="dog-grid">
          {dogs.map((dog) => (
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
                  onClick={() => handleDeleteDog(dog.id)}
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
          font-size: 14px;
        }

        .lead {
          margin: 0;
          color: #4b5563;
        }

        .hint {
          font-size: 13px;
          color: #6b7280;
        }

        .error {
          margin-top: 6px;
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
