// src/app/inventory/detail/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function InventoryDetailPage() {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    async function fetchItem() {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();
      setItem(data);
    }
    fetchItem();
  }, [id]);

  if (!item) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Inventory Item Details</h1>
      <ul className="space-y-2">
        <li><strong>Item Name:</strong> {item.item_name}</li>
        <li><strong>SKU:</strong> {item.sku}</li>
        <li><strong>Title:</strong> {item.title}</li>
        <li><strong>Quantity:</strong> {item.quantity}</li>
        <li><strong>Cost:</strong> ${item.unit_cost}</li>
        <li><strong>Sales Price:</strong> ${item.sales_price}</li>
        <li><strong>Platform:</strong> {item.platform_type}</li>
        <li><strong>Date Purchased:</strong> {item.date_purchased}</li>
        <li><strong>Purchased From:</strong> {item.where_purchased}</li>
      </ul>
    </div>
  );
}
