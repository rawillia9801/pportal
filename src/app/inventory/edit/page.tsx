// src/app/inventory/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditInventoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    item_name: '',
    sku: '',
    title: '',
    qty: 0,
    unit_cost: 0,
    sales_price: 0,
    platform: '',
    where_purchased: '',
    date_purchased: '',
  });

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setItem(data);
        setForm(data);
      }
      setLoading(false);
    }

    fetchItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('inventory')
      .update(form)
      .eq('id', id);

    if (!error) {
      router.push('/dashboard/inventory/view');
    } else {
      alert('Error updating inventory');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Inventory Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="item_name" value={form.item_name} onChange={handleChange} placeholder="Item Name" className="input" />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="input" />
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title / Notes" className="input" />
        <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="Quantity" className="input" />
        <input name="unit_cost" type="number" value={form.unit_cost} onChange={handleChange} placeholder="Unit Cost ($)" className="input" />
        <input name="sales_price" type="number" value={form.sales_price} onChange={handleChange} placeholder="Sales Price ($)" className="input" />
        <input name="where_purchased" value={form.where_purchased} onChange={handleChange} placeholder="Where Purchased" className="input" />
        <input name="date_purchased" type="date" value={form.date_purchased?.slice(0, 10)} onChange={handleChange} className="input" />
        <select name="platform" value={form.platform} onChange={handleChange} className="input">
          <option value="">-- Select Platform --</option>
          <option value="Walmart">Walmart</option>
          <option value="Walmart WFS">Walmart WFS</option>
          <option value="eBay">eBay</option>
          <option value="Amazon">Amazon</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Update</button>
      </form>
    </div>
  );
}
