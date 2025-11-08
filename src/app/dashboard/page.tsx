'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Stat = { label: string; value: string | number };

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      const [
        { count: orderCount, error: orderErr },
        { count: inventoryCount, error: invErr },
        { data: salesData, error: salesErr },
        { data: billsData, error: billsErr },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('inventory').select('*', { count: 'exact', head: true }),
        supabase
          .from('platform_sales')
          .select('total_sale', { head: false })
          .then(({ data, error }) => ({
            data: data?.reduce((sum, row: any) => sum + Number(row.total_sale), 0) || 0,
            error,
          })),
        supabase
          .from('bills')
          .select('amount', { head: false })
          .eq('paid', false)
          .then(({ data, error }) => ({
            data: data?.reduce((sum, row: any) => sum + Number(row.amount), 0) || 0,
            error,
          })),
      ]);

      if (orderErr || invErr || salesErr || billsErr) {
        setError(
          orderErr?.message ||
            invErr?.message ||
            salesErr?.message ||
            billsErr?.message ||
            'Unknown error'
        );
      } else {
        setStats([
          { label: 'Total Orders', value: orderCount ?? 0 },
          { label: 'Total Inventory Items', value: inventoryCount ?? 0 },
          { label: 'Total Sales ($)', value: salesData.toFixed(2) },
          { label: 'Bills Due ($)', value: billsData.toFixed(2) },
        ]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="p-8">Loading dashboard…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white shadow rounded-lg p-4 text-center"
          >
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
