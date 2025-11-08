'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/dbTypes';
import Link from 'next/link';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];

export default function InventoryViewPage() {
  const supabase = createClientComponentClient<Database>();
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Fetch error:', error);
      else setItems(data || []);
    };

    fetchInventory();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <table className="w-full table-auto border border-gray-200 shadow-sm rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-sm font-semibold px-4 py-2">Item Name</th>
            <th className="text-sm font-semibold px-4 py-2">SKU</th>
            <th className="text-sm font-semibold px-4 py-2">Qty</th>
            <th className="text-sm font-semibold px-4 py-2">Unit Cost</th>
            <th className="text-sm font-semibold px-4 py-2">Listed On</th>
            <th className="text-sm font-semibold px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="text-sm px-4 py-2">{item.item_name}</td>
              <td className="text-sm px-4 py-2">{item.sku}</td>
              <td className="text-sm px-4 py-2">{item.quantity}</td>
              <td className="text-sm px-4 py-2">${item.unit_cost?.toFixed(2)}</td>
              <td className="text-sm px-4 py-2">{item.platform || '-'}</td>
              <td className="text-sm px-4 py-2 space-x-2">
                <Link href={`/dashboard/inventory/detail/${item.id}`} className="text-blue-600 hover:underline">View</Link>
                <Link href={`/dashboard/inventory/edit/${item.id}`} className="text-yellow-600 hover:underline">Edit</Link>
                <Link href={`/dashboard/inventory/adjust/${item.id}`} className="text-red-600 hover:underline">Adjust</Link>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-4">
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
