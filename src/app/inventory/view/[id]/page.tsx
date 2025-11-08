/* ── src/app/inventory/view/[id]/page.tsx ───────────── */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link                        from 'next/link';
import { createClientComponentClient }
        from '@supabase/auth-helpers-nextjs';

/* — types — */
type Item = {
  id:          string;
  item_name:   string;
  sku:         string;
  title:       string | null;
  unit_cost:   number;
};
type Movement = {
  id:          string;
  created_at:  string;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  qty_changed: number;
  reason:      string | null;
};

/* — component — */
export default function InventoryDetail() {
  const { id }  = useParams<{ id: string }>();   // item UUID from URL
  const router  = useRouter();
  const supabase = createClientComponentClient();

  const [item,      setItem]      = useState<Item|null>(null);
  const [moves,     setMoves]     = useState<Movement[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string|null>(null);

  /* fetch once ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      /* auth check */
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { router.push('/login'); return; }

      /* 1) item row */
      const { data: itemData, error: itemErr } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();

      if (itemErr) { setError(itemErr.message); setLoading(false); return; }

      /* 2) movements */
      const { data: mv, error: mvErr } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('inventory_id', id)
        .order('created_at', { ascending: false });      // newest first

      if (mvErr) { setError(mvErr.message); setLoading(false); return; }

      setItem(itemData as Item);
      setMoves(mv as Movement[]);
      setLoading(false);
    })();
  }, [id]);

  /* ui -------------------------------------------------------------------- */
  if (loading) return <p className="p-6">Loading…</p>;
  if (error)   return <p className="p-6 text-red-600">{error}</p>;
  if (!item)   return <p className="p-6">Item not found / no access.</p>;

  return (
    <main className="p-6 space-y-6">
      <button onClick={()=>router.back()} className="text-blue-600 underline">
        ← Back
      </button>

      {/* Item header */}
      <section className="bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold mb-2">{item.item_name}</h1>
        <p className="text-sm text-gray-600 mb-4">{item.title}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <span className="font-medium">SKU:</span>
          <span>{item.sku}</span>

          <span className="font-medium">Unit Cost:</span>
          <span>${item.unit_cost.toFixed(2)}</span>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={`/inventory/adjust/${item.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded">
            Adjust Qty
          </Link>
          <Link href={`/inventory/delete/${item.id}`}
                className="px-4 py-2 bg-red-600 text-white rounded">
            Delete
          </Link>
        </div>
      </section>

      {/* Movement history */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Movement History</h2>

        {moves.length === 0 ? (
          <p className="text-gray-500">No movements yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Qty&nbsp;Δ</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {moves.map(m => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">{m.movement_type}</td>
                    <td className="px-4 py-2 text-center">
                      {m.qty_changed > 0 ? '+' : ''}{m.qty_changed}
                    </td>
                    <td className="px-4 py-2">{m.reason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
