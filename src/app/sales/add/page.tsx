'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Platform = 'Walmart' | 'Walmart WFS' | 'eBay' | 'Puppies' | 'Other';
type Category = 'Pet Supplies' | 'Electronics' | 'Apparel' | 'Miscellaneous';

export default function AddSalePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [platform, setPlatform] = useState<Platform>('Walmart');
  const [category, setCategory] = useState<Category>('Pet Supplies');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceEach, setPriceEach] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [cogs, setCogs] = useState(0);

  const [commissionRate, setCommissionRate] = useState<number | null>(null);
  const [feeAmount, setFeeAmount] = useState(0);
  const [error, setError] = useState('');

  // Fetch the commission rate whenever platform/category changes
  useEffect(() => {
    if (!platform || !category) return;

    (async () => {
      const { data, error } = await supabase
        .from('commission_rates')
        .select('rate_pct')
        .eq('platform', platform)
        .eq('category', category)
        .single();

      if (error) {
        setError(error.message);
        setCommissionRate(null);
        setFeeAmount(0);
      } else if (data) {
        setCommissionRate(data.rate_pct);
        const fee =
          Number(data.rate_pct) *
          Number(priceEach) *
          Number(quantity || 1);
        setFeeAmount(fee);
      }
    })();
  }, [platform, category, priceEach, quantity]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { error } = await supabase.from('platform_sales').insert([
      {
        platform,
        sale_date: new Date().toISOString().slice(0, 10), // today
        product_name: productName,
        quantity,
        price_each: priceEach,
        shipping_cost: shippingCost,
        commission_fee: feeAmount,
        cogs,
        category,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      alert('Sale recorded!');
      router.push('/dashboard');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow space-y-4"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          Record a Platform Sale
        </h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full border px-3 py-2 mt-1 rounded"
          >
            <option value="Walmart">Walmart</option>
            <option value="Walmart WFS">Walmart WFS</option>
            <option value="eBay">eBay</option>
            <option value="Puppies">Puppies</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full border px-3 py-2 mt-1 rounded"
          >
            <option value="Pet Supplies">Pet Supplies</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        {/* Product Name */}
        <input
          type="text"
          placeholder="Product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full border px-3 py-2"
          required
        />

        {/* Quantity */}
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full border px-3 py-2"
          required
        />

        {/* Price Each */}
        <input
          type="number"
          placeholder="Price each ($)"
          value={priceEach}
          onChange={(e) => setPriceEach(Number(e.target.value))}
          className="w-full border px-3 py-2"
          step="0.01"
          required
        />

        {/* Shipping Cost */}
        <input
          type="number"
          placeholder="Shipping cost ($)"
          value={shippingCost}
          onChange={(e) => setShippingCost(Number(e.target.value))}
          className="w-full border px-3 py-2"
          step="0.01"
        />

        {/* COGS */}
        <input
          type="number"
          placeholder="COGS ($)"
          value={cogs}
          onChange={(e) => setCogs(Number(e.target.value))}
          className="w-full border px-3 py-2"
          step="0.01"
        />

        {/* Auto-calculated commission fee */}
        <input
          type="text"
          readOnly
          value={commissionRate !== null ? feeAmount.toFixed(2) : 'N/A'}
          className="w-full border px-3 py-2 bg-gray-100 text-gray-700"
        />

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Record Sale
        </button>
      </form>
    </div>
  );
}
