/* ── src/app/inventory/add/page.tsx ───────────────────────── */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AddInventoryPage() {
  const supabase   = createClientComponentClient();
  const router     = useRouter();

  /* ── form state ────────────────────────────────────────── */
  const [itemName,      setItemName]      = useState('');
  const [sku,           setSku]           = useState('');
  const [title,         setTitle]         = useState('');
  const [qty,           setQty]           = useState(0);
  const [unitCost,      setUnitCost]      = useState(0);
  const [datePurchased, setDatePurchased] = useState('');
  const [whereBought,   setWhereBought]   = useState('');
  const [salesPrice,    setSalesPrice]    = useState(0);
  const [hasSerial,     setHasSerial]     = useState(false);
  const [serials,       setSerials]       = useState<string[]>(['']);
  const [platform,      setPlatform]      = useState<'Walmart' | 'WFS' | 'Amazon' | 'eBay' | 'Other'>('Walmart');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* ── helpers ───────────────────────────────────────────── */
  const totalCost = qty * unitCost;              // local calc
  const handleSerialChange = (i: number, v: string) => {
    const next = [...serials];
    next[i] = v; setSerials(next);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setError('Not signed in'); setLoading(false); return; }

    try {
      const { error: txnError } = await supabase.rpc('insert_inventory_with_movement', {
        p_user_id:        user.user.id,
        p_item_name:      itemName,
        p_sku:            sku,
        p_title:          title,
        p_qty:            qty,
        p_unit_cost:      unitCost,
        p_date_purchased: datePurchased || null,
        p_where_bought:   whereBought,
        p_sales_price:    salesPrice || null,
        p_platform:       platform,
        p_serials:        hasSerial ? serials.filter(Boolean) : null
      });

      if (txnError) throw txnError;

      router.push('/dashboard/inventory/view');
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  /* ── ui ────────────────────────────────────────────────── */
  return (
    <main className="flex justify-center items-center min-h-[80vh] bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Add Inventory</h1>

        <label className="block text-sm">Item Name</label>
        <input  className="input" value={itemName}
                onChange={e=>setItemName(e.target.value)} required />

        <label className="block text-sm">SKU</label>
        <input  className="input" value={sku}
                onChange={e=>setSku(e.target.value)} required />

        <label className="block text-sm">Title / Description</label>
        <input  className="input" value={title}
                onChange={e=>setTitle(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Quantity</label>
            <input type="number" min={0} className="input"
                   value={qty} onChange={e=>setQty(+e.target.value)} required/>
          </div>
          <div>
            <label className="block text-sm">Unit Cost ($)</label>
            <input type="number" min={0} step="0.01" className="input"
                   value={unitCost} onChange={e=>setUnitCost(+e.target.value)} required/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Date Purchased</label>
            <input type="date" className="input"
                   value={datePurchased}
                   onChange={e=>setDatePurchased(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Where Purchased</label>
            <input className="input" value={whereBought}
                   onChange={e=>setWhereBought(e.target.value)} />
          </div>
        </div>

        <label className="block text-sm">Default Sales Price ($)</label>
        <input type="number" min={0} step="0.01" className="input"
               value={salesPrice} onChange={e=>setSalesPrice(+e.target.value)} />

        <label className="block text-sm">Platform Listed On</label>
        <select className="input"
                value={platform}
                onChange={e=>setPlatform(e.target.value as any)}>
          <option>Walmart</option>
          <option>WFS</option>
          <option>Amazon</option>
          <option>eBay</option>
          <option>Other</option>
        </select>

        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" checked={hasSerial}
                 onChange={e=>setHasSerial(e.target.checked)}
                 className="h-4 w-4" />
          <span>Item has serial number(s)</span>
        </label>

        {hasSerial && serials.map((sn, i)=>(
          <input key={i} className="input mt-1"
                 placeholder={`Serial #${i+1}`}
                 value={sn}
                 onChange={e=>handleSerialChange(i,e.target.value)} />
        ))}
        {hasSerial && (
          <button type="button" className="text-blue-600 text-sm"
                  onClick={()=>setSerials([...serials,''])}>
            + Add another serial
          </button>
        )}

        <p className="text-right text-sm font-semibold">
          Total Cost: ${(totalCost || 0).toFixed(2)}
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>

      {/* tailwind shortcut for consistent inputs */}
      <style jsx>{`
        .input {
          @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring;
        }
      `}</style>
    </main>
  );
}
