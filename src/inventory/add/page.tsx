'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AddInventoryPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [sku,        setSku]        = useState('');
  const [title,      setTitle]      = useState('');
  const [qty,        setQty]        = useState<number>(0);
  const [cost,       setCost]       = useState<number>(0);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // 1️⃣  — upsert into inventory_items
    const { data: item, error: itemErr } = await supabase
      .from('inventory_items')
      .upsert(
        { sku, title, cost },            // if sku exists update title / cost
        { onConflict: 'sku', returning: 'representation' }
      )
      .single();

    if (itemErr) {
      setErrorMsg(itemErr.message);
      setLoading(false);
      return;
    }

    // 2️⃣  — insert a movement row (positive quantity)
    const { error: moveErr } = await supabase.from('inventory_movements').insert({
      item_id: item.id,
      change_qty: qty,
      movement_type: 'RECEIVE', // or 'ADJUST'
      notes: 'Initial stock'
    });

    if (moveErr) {
      setErrorMsg(moveErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/inventory/view');      // jump to list page
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Add Inventory</h1>

        <input
          className="w-full rounded border px-3 py-2"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />

        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Title / Description"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          min={0}
          className="w-full rounded border px-3 py-2"
          placeholder="Quantity"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
        />

        <input
          type="number"
          step="0.01"
          min={0}
          className="w-full rounded border px-3 py-2"
          placeholder="Unit Cost ($)"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          required
        />

        {errorMsg && (
          <p className="rounded bg-red-100 px-2 py-1 text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
    </main>
  );
}
