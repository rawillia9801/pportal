'use client'

/* ============================================
   CHANGELOG
   - 2025-11-13: Admin shell with LEFT sidebar
   - 2025-11-13: New Dashboard tab for /admin landing
   - 2025-11-13: Buyers view kept + manual puppy/payment
   - 2025-11-13: Dashboard shows activity counts
   ============================================ */

import React, { useEffect, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ============================================
   ANCHOR: SUPABASE HELPERS
   ============================================ */

type AnyClient = SupabaseClient<any, 'public', any>
let __sb: AnyClient | null = null

function getSupabaseEnv() {
  const g: any = (typeof window !== 'undefined' ? window : globalThis) as any
  const hasProc =
    typeof process !== 'undefined' &&
    (process as any) &&
    (process as any).env

  const url = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL
    : (g.NEXT_PUBLIC_SUPABASE_URL ||
       g.__ENV?.NEXT_PUBLIC_SUPABASE_URL ||
       '')

  const key = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : (g.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
       g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
       '')

  return { url: String(url || ''), key: String(key || '') }
}

async function getBrowserClient(): Promise<AnyClient> {
  if (__sb) return __sb
  const { url, key } = getSupabaseEnv()
  if (!url || !key) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  __sb = createClient(url, key)
  return __sb
}

/* ============================================
   ANCHOR: TYPES
   ============================================ */

type AdminTabKey =
  | 'dashboard'
  | 'puppies'
  | 'upcoming_litters'
  | 'applications'
  | 'payments'
  | 'messages'
  | 'transport'
  | 'breeding'
  | 'buyers'

type AdminTab = { key: AdminTabKey; label: string }

const ADMIN_TABS: AdminTab[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'puppies', label: 'Puppies' },
  { key: 'upcoming_litters', label: 'Upcoming Litters' },
  { key: 'applications', label: 'Applications' },
  { key: 'payments', label: 'Payments' },
  { key: 'messages', label: 'Messages' },
  { key: 'transport', label: 'Transportation Request' },
  { key: 'breeding', label: 'Breeding Program' },
  { key: 'buyers', label: 'Buyers' },
]

type BuyerRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

type PuppySummary = {
  id: string
  name: string | null
  status: string | null
  price: number | null
  dam_name?: string | null
}

type PaymentSummary = {
  id: string
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
  puppy_name: string | null
  notes: string | null
}

type TransportSummary = {
  id: string
  trip_date: string | null
  from_location: string | null
  to_location: string | null
  miles: number | null
  tolls: number | null
  hotel_cost: number | null
  fuel_cost: number | null
}

type BuyerDetail = {
  buyer: BuyerRow & {
    address_line1?: string | null
    postal_code?: string | null
    notes?: string | null
  }
  puppies: PuppySummary[]
  payments: PaymentSummary[]
  transports: TransportSummary[]
}

type DashboardCounts = {
  buyers: number | null
  applications: number | null
  payments: number | null
  messages: number | null
  transports: number | null
}

/* ============================================
   ANCHOR: ROOT ADMIN PAGE
   ============================================ */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard')

  // Inline layout styles so the sidebar is ALWAYS on the left
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    background:
      'radial-gradient(60% 100% at 100% 0%, #0b1120 0%, transparent 60%),' +
      'radial-gradient(60% 100% at 0% 0%, #020617 0%, transparent 60%),' +
      '#020617',
    color: '#f9fafb',
    fontFamily:
      'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  }

  const sidebarStyle: React.CSSProperties = {
    width: 240,
    padding: '18px 14px',
    boxSizing: 'border-box',
    borderRight: '1px solid #1f2937',
    background: 'linear-gradient(180deg,#020617,#111827)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  }

  const brandRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  const logoStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  }

  const tabsContainerStyle: React.CSSProperties = {
    marginTop: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }

  const tabBaseStyle: React.CSSProperties = {
    border: '1px solid #1f2937',
    background: '#020617',
    color: '#e5e7eb',
    borderRadius: 10,
    padding: '9px 10px',
    textAlign: 'left',
    fontSize: '.9rem',
    cursor: 'pointer',
    transition:
      'background .12s ease, transform .12s ease, box-shadow .12s ease, border-color .12s ease',
  }

  const tabActiveStyle: React.CSSProperties = {
    ...tabBaseStyle,
    background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
    color: '#111827',
    borderColor: 'transparent',
    fontWeight: 600,
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '20px 22px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <main style={layoutStyle}>
      {/* LEFT SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={brandRowStyle}>
          <div style={logoStyle}>🐶</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>
              SWVA Chihuahua
            </div>
            <div style={{ fontSize: '.8rem', color: '#e5e7eb' }}>
              Admin Panel
            </div>
          </div>
        </div>

        <nav style={tabsContainerStyle}>
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={activeTab === tab.key ? tabActiveStyle : tabBaseStyle}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <section style={mainStyle}>
        {activeTab === 'dashboard' && (
          <AdminHomeDashboard onOpenTab={setActiveTab} />
        )}

        {activeTab === 'buyers' && <BuyersView />}

        {activeTab !== 'dashboard' && activeTab !== 'buyers' && (
          <div className="comingSoon">
            <h1>{ADMIN_TABS.find((t) => t.key === activeTab)?.label}</h1>
            <p>We’ll wire this section after Buyers is complete.</p>
          </div>
        )}

        <style jsx>{`
          .comingSoon {
            margin: auto;
            text-align: center;
            color: #9ca3af;
          }
          .comingSoon h1 {
            margin-bottom: 8px;
          }
        `}</style>
      </section>
    </main>
  )
}

/* ============================================
   ANCHOR: DASHBOARD (ADMIN LANDING)
   ============================================ */

function AdminHomeDashboard({
  onOpenTab,
}: {
  onOpenTab: (tab: AdminTabKey) => void
}) {
  const [counts, setCounts] = useState<DashboardCounts>({
    buyers: null,
    applications: null,
    payments: null,
    messages: null,
    transports: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      const next: DashboardCounts = {
        buyers: null,
        applications: null,
        payments: null,
        messages: null,
        transports: null,
      }

      try {
        const sb = await getBrowserClient()

        // Buyers
        try {
          const res = await sb
            .from('puppy_buyers')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number') next.buyers = res.count
        } catch {}

        // Applications table name is a guess – safe even if it doesn't exist.
        try {
          const res = await sb
            .from('puppy_applications')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.applications = res.count
        } catch {}

        // Payments
        try {
          const res = await sb
            .from('puppy_payments')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.payments = res.count
        } catch {}

        // Messages table name is a guess – adjust when you create it.
        try {
          const res = await sb
            .from('puppy_messages')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.messages = res.count
        } catch {}

        // Transportation requests
        try {
          const res = await sb
            .from('transport_requests')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.transports = res.count
        } catch {}

        setCounts(next)
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard stats.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const cards = [
    {
      key: 'applications' as const,
      label: 'Applications',
      desc: 'New and pending puppy applications.',
      count: counts.applications,
      tab: 'applications' as AdminTabKey,
    },
    {
      key: 'payments' as const,
      label: 'Payments',
      desc: 'Deposits, balances, and payment plans.',
      count: counts.payments,
      tab: 'payments' as AdminTabKey,
    },
    {
      key: 'messages' as const,
      label: 'Messages',
      desc: 'Questions and updates from buyers.',
      count: counts.messages,
      tab: 'messages' as AdminTabKey,
    },
    {
      key: 'transport' as const,
      label: 'Transportation',
      desc: 'Pickup and delivery requests.',
      count: counts.transports,
      tab: 'transport' as AdminTabKey,
    },
    {
      key: 'buyers' as const,
      label: 'Buyers',
      desc: 'Families in your program.',
      count: counts.buyers,
      tab: 'buyers' as AdminTabKey,
    },
  ]

  return (
    <section className="dashWrap">
      <header className="dashHeader">
        <div>
          <h1>Admin Overview</h1>
          <p className="muted">
            Quick snapshot of applications, payments, messages, and travel.
          </p>
        </div>
        {loading && <span className="miniTag">Loading…</span>}
      </header>

      {error && <div className="dashError">{error}</div>}

      <div className="dashGrid">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            className="dashCard"
            onClick={() => onOpenTab(card.tab)}
          >
            <div className="dashCardTop">
              <span className="dashLabel">{card.label}</span>
              <span
                className={
                  'dashCount ' +
                  (card.count != null && card.count > 0 ? 'hasActivity' : '')
                }
              >
                {card.count != null ? card.count : '—'}
              </span>
            </div>
            <p className="dashDesc">{card.desc}</p>
            {card.count != null && card.count > 0 && (
              <div className="dashActivity">Activity detected</div>
            )}
            <div className="dashFooter">Open {card.label}</div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .dashWrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dashHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dashHeader h1 {
          margin: 0 0 4px;
        }
        .dashHeader .muted {
          margin: 0;
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .miniTag {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        .dashError {
          background: rgba(127, 29, 29, 0.9);
          border: 1px solid #b91c1c;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .dashGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .dashCard {
          border-radius: 14px;
          border: 1px solid #1f2937;
          background: radial-gradient(circle at top left, #020617, #020617);
          padding: 12px 14px 10px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
          transition:
            transform 0.12s ease,
            box-shadow 0.12s ease,
            border-color 0.12s ease,
            background 0.12s ease;
        }
        .dashCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          border-color: #e0a96d;
        }
        .dashCardTop {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
        }
        .dashLabel {
          font-weight: 600;
        }
        .dashCount {
          font-weight: 600;
          font-size: 1.2rem;
          color: #9ca3af;
        }
        .dashCount.hasActivity {
          color: #f97316;
        }
        .dashDesc {
          margin: 0;
          font-size: 0.9rem;
          color: #9ca3af;
        }
        .dashActivity {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #f97316;
        }
        .dashFooter {
          margin-top: 6px;
          font-size: 0.82rem;
          color: #e0a96d;
        }
      `}</style>
    </section>
  )
}

/* ============================================
   ANCHOR: BUYERS VIEW
   - Buyers list on left
   - Detail panel on right
   - Manual puppy + payment + transport summary
   ============================================ */

function BuyersView() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BuyerDetail | null>(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add buyer form
  const [newBuyerName, setNewBuyerName] = useState('')
  const [newBuyerEmail, setNewBuyerEmail] = useState('')
  const [newBuyerPhone, setNewBuyerPhone] = useState('')
  const [savingBuyer, setSavingBuyer] = useState(false)

  // Manual puppy form (past sales)
  const [newPuppyName, setNewPuppyName] = useState('')
  const [newPuppyStatus, setNewPuppyStatus] = useState('')
  const [newPuppyPrice, setNewPuppyPrice] = useState('')
  const [savingPuppy, setSavingPuppy] = useState(false)

  // Manual payment form (past sales)
  const [newPayType, setNewPayType] = useState('')
  const [newPayAmount, setNewPayAmount] = useState('')
  const [newPayDate, setNewPayDate] = useState('')
  const [newPayMethod, setNewPayMethod] = useState('')
  const [newPayNotes, setNewPayNotes] = useState('')
  const [newPayPuppyId, setNewPayPuppyId] = useState<string | ''>('')
  const [savingPayment, setSavingPayment] = useState(false)

  // Load buyers list
  useEffect(() => {
    ;(async () => {
      setLoadingList(true)
      setError(null)
      try {
        const sb = await getBrowserClient()
        const { data, error } = await sb
          .from('puppy_buyers')
          .select('id, full_name, email, phone, city, state, created_at')
          .order('created_at', { ascending: false })
        if (error) throw error
        setBuyers(data || [])
        if (data && data.length > 0) {
          setSelectedId((prev) => prev || data[0].id)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load buyers.')
      } finally {
        setLoadingList(false)
      }
    })()
  }, [])

  // Load selected buyer detail
  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    ;(async () => {
      setLoadingDetail(true)
      setError(null)
      try {
        const sb = await getBrowserClient()

        const [buyerRes, puppiesRes, payRes, transRes] = await Promise.all([
          sb
            .from('puppy_buyers')
            .select(
              'id, full_name, email, phone, address_line1, city, state, postal_code, created_at, notes'
            )
            .eq('id', selectedId)
            .single(),
          sb
            .from('puppies')
            .select('id, name, status, price')
            .eq('buyer_id', selectedId)
            .order('created_at', { ascending: false }),
          sb
            .from('puppy_payments')
            .select('id, type, amount, payment_date, method, puppy_id, notes')
            .eq('buyer_id', selectedId)
            .order('payment_date', { ascending: false }),
          sb
            .from('transport_requests')
            .select(
              'id, trip_date, from_location, to_location, miles, tolls, hotel_cost, fuel_cost'
            )
            .eq('buyer_id', selectedId)
            .order('trip_date', { ascending: false }),
        ])

        if (buyerRes.error) throw buyerRes.error
        if (puppiesRes.error) throw puppiesRes.error
        if (payRes.error) throw payRes.error
        if (transRes.error) throw transRes.error

        const buyer = buyerRes.data as BuyerDetail['buyer']

        const rawPuppies = (puppiesRes.data || []) as any[]
        const puppies: PuppySummary[] = rawPuppies.map((p) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          price: p.price,
          dam_name: null,
        }))

        const puppyMap = new Map<string, PuppySummary>()
        puppies.forEach((p) => {
          if (p.id) puppyMap.set(p.id, p)
        })

        const payments: PaymentSummary[] = (payRes.data || []).map((p: any) => ({
          id: p.id,
          type: p.type,
          amount: p.amount,
          payment_date: p.payment_date,
          method: p.method,
          puppy_name: p.puppy_id ? puppyMap.get(p.puppy_id)?.name || null : null,
          notes: p.notes ?? null,
        }))

        const transports = (transRes.data || []) as TransportSummary[]

        setDetail({
          buyer,
          puppies,
          payments,
          transports,
        })
      } catch (e: any) {
        setError(e?.message || 'Failed to load buyer details.')
      } finally {
        setLoadingDetail(false)
      }
    })()
  }, [selectedId])

  // Add buyer
  async function handleAddBuyer(e: React.FormEvent) {
    e.preventDefault()
    if (!newBuyerName.trim()) return
    setSavingBuyer(true)
    setError(null)
    try {
      const sb = await getBrowserClient()
      const { data, error } = await sb
        .from('puppy_buyers')
        .insert({
          full_name: newBuyerName.trim(),
          email: newBuyerEmail.trim() || null,
          phone: newBuyerPhone.trim() || null,
          source: 'manual',
        })
        .select('id, full_name, email, phone, city, state, created_at')
        .single()
      if (error) throw error
      const newRow = data as BuyerRow
      setBuyers((prev) => [newRow, ...prev])
      setSelectedId(newRow.id)
      setNewBuyerName('')
      setNewBuyerEmail('')
      setNewBuyerPhone('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add buyer.')
    } finally {
      setSavingBuyer(false)
    }
  }

  // Add puppy manually
  async function handleAddPuppy(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    if (!newPuppyName.trim()) return

    setSavingPuppy(true)
    setError(null)
    try {
      const sb = await getBrowserClient()
      const priceNum = newPuppyPrice ? Number(newPuppyPrice) : null

      const { data, error } = await sb
        .from('puppies')
        .insert({
          buyer_id: selectedId,
          name: newPuppyName.trim(),
          status: newPuppyStatus || null,
          price: priceNum,
        })
        .select('id, name, status, price')
        .single()

      if (error) throw error

      const inserted: PuppySummary = {
        id: data.id,
        name: data.name,
        status: data.status,
        price: data.price,
        dam_name: null,
      }

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              puppies: [inserted, ...prev.puppies],
            }
          : prev
      )

      setNewPuppyName('')
      setNewPuppyStatus('')
      setNewPuppyPrice('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add puppy.')
    } finally {
      setSavingPuppy(false)
    }
  }

  // Add payment manually
  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    if (!newPayAmount) return

    setSavingPayment(true)
    setError(null)
    try {
      const sb = await getBrowserClient()
      const amountNum = Number(newPayAmount)

      const { data, error } = await sb
        .from('puppy_payments')
        .insert({
          buyer_id: selectedId,
          puppy_id: newPayPuppyId || null,
          type: newPayType || 'payment',
          amount: amountNum,
          payment_date: newPayDate || null,
          method: newPayMethod || null,
          notes: newPayNotes || null,
        })
        .select('id, type, amount, payment_date, method, puppy_id, notes')
        .single()

      if (error) throw error

      const puppyName =
        data.puppy_id && detail
          ? detail.puppies.find((p) => p.id === data.puppy_id)?.name || null
          : null

      const inserted: PaymentSummary = {
        id: data.id,
        type: data.type,
        amount: data.amount,
        payment_date: data.payment_date,
        method: data.method,
        puppy_name: puppyName,
        notes: data.notes ?? null,
      }

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              payments: [inserted, ...prev.payments],
            }
          : prev
      )

      setNewPayType('')
      setNewPayAmount('')
      setNewPayDate('')
      setNewPayMethod('')
      setNewPayNotes('')
      setNewPayPuppyId('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add payment.')
    } finally {
      setSavingPayment(false)
    }
  }

  return (
    <div className="buyersWrapper">
      <header className="buyersHeader">
        <div>
          <h1>Buyers</h1>
          <p className="muted">
            Manage your approved families, their puppies, payment history, and
            transportation details.
          </p>
        </div>
      </header>

      {/* Add Buyer */}
      <section className="addBuyerCard">
        <h2>Add Buyer</h2>
        <p className="muted">
          You can also auto-create buyers later from approved applications.
        </p>
        <form className="addBuyerForm" onSubmit={handleAddBuyer}>
          <input
            placeholder="Full name"
            value={newBuyerName}
            onChange={(e) => setNewBuyerName(e.target.value)}
            required
          />
          <input
            placeholder="Email (optional)"
            type="email"
            value={newBuyerEmail}
            onChange={(e) => setNewBuyerEmail(e.target.value)}
          />
          <input
            placeholder="Phone (optional)"
            value={newBuyerPhone}
            onChange={(e) => setNewBuyerPhone(e.target.value)}
          />
          <button type="submit" disabled={savingBuyer}>
            {savingBuyer ? 'Saving…' : 'Save Buyer'}
          </button>
        </form>
      </section>

      {error && <div className="errorBanner">{error}</div>}

      <section className="buyersMain">
        {/* LEFT LIST */}
        <div className="buyersListCard">
          <div className="buyersListHeader">
            <h3>All Buyers</h3>
            {loadingList && <span className="miniTag">Loading…</span>}
          </div>
          <div className="buyersList">
            {buyers.length === 0 && !loadingList && (
              <div className="emptyState">
                No buyers yet. Add your first buyer above.
              </div>
            )}
            {buyers.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`buyerRow ${selectedId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedId(b.id)}
              >
                <div className="buyerRowTop">
                  <span className="buyerName">{b.full_name}</span>
                  {b.city && (
                    <span className="buyerLocation">
                      {b.city}
                      {b.state ? `, ${b.state}` : ''}
                    </span>
                  )}
                </div>
                <div className="buyerRowBottom">
                  {b.email && <span className="chip">{b.email}</span>}
                  {b.phone && <span className="chip">{b.phone}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT DETAIL */}
        <div className="buyerDetailCard">
          {(!detail || loadingDetail) && (
            <div className="detailPlaceholder">
              {loadingDetail
                ? 'Loading buyer details…'
                : 'Select a buyer from the list.'}
            </div>
          )}

          {detail && !loadingDetail && (
            <>
              <div className="buyerDetailHeader">
                <div>
                  <h2>{detail.buyer.full_name}</h2>
                  <p className="muted">
                    {detail.buyer.city ? (
                      <>
                        {detail.buyer.city}
                        {detail.buyer.state ? `, ${detail.buyer.state}` : ''}
                      </>
                    ) : (
                      'Buyer details'
                    )}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <section className="detailSection">
                <h3>Contact Information</h3>
                <div className="detailGrid">
                  <div>
                    <div className="label">Email</div>
                    <div>{detail.buyer.email || '—'}</div>
                  </div>
                  <div>
                    <div className="label">Phone</div>
                    <div>{detail.buyer.phone || '—'}</div>
                  </div>
                  <div>
                    <div className="label">Address</div>
                    <div>
                      {detail.buyer.address_line1 && (
                        <div>{detail.buyer.address_line1}</div>
                      )}
                      {(detail.buyer.city ||
                        detail.buyer.state ||
                        detail.buyer.postal_code) && (
                        <div>
                          {detail.buyer.city}
                          {detail.buyer.state ? `, ${detail.buyer.state}` : ''}
                          {detail.buyer.postal_code
                            ? ` ${detail.buyer.postal_code}`
                            : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Puppies */}
              <section className="detailSection">
                <h3>Puppies</h3>
                {detail.puppies.length === 0 && (
                  <div className="emptyLine">No puppies assigned yet.</div>
                )}
                {detail.puppies.length > 0 && (
                  <div className="table">
                    <div className="tableHead">
                      <span>Puppy</span>
                      <span>Status</span>
                      <span>Dam</span>
                      <span>Price</span>
                    </div>
                    {detail.puppies.map((p) => (
                      <div key={p.id} className="tableRow">
                        <span className="clickableName">
                          {p.name || 'Unnamed'}
                        </span>
                        <span>{p.status || '—'}</span>
                        <span>{p.dam_name || '—'}</span>
                        <span>
                          {p.price != null ? `$${p.price.toFixed(2)}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual puppy form */}
                <div className="miniForm">
                  <div className="miniFormTitle">Add Puppy (manual)</div>
                  <form className="miniFormRow" onSubmit={handleAddPuppy}>
                    <input
                      placeholder="Name"
                      value={newPuppyName}
                      onChange={(e) => setNewPuppyName(e.target.value)}
                      required
                    />
                    <select
                      value={newPuppyStatus}
                      onChange={(e) => setNewPuppyStatus(e.target.value)}
                    >
                      <option value="">Status</option>
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                      <option value="kept">Kept</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={newPuppyPrice}
                      onChange={(e) => setNewPuppyPrice(e.target.value)}
                    />
                    <button type="submit" disabled={savingPuppy}>
                      {savingPuppy ? 'Saving…' : 'Save'}
                    </button>
                  </form>
                </div>
              </section>

              {/* Payments */}
              <section className="detailSection">
                <h3>Payments</h3>
                {detail.payments.length === 0 && (
                  <div className="emptyLine">No payments recorded.</div>
                )}
                {detail.payments.length > 0 && (
                  <div className="table payments">
                    <div className="tableHead">
                      <span>Date</span>
                      <span>Type</span>
                      <span>Puppy</span>
                      <span>Amount</span>
                      <span>Method / Notes</span>
                    </div>
                    {detail.payments.map((p) => (
                      <div key={p.id} className="tableRow">
                        <span>
                          {p.payment_date
                            ? p.payment_date.slice(0, 10)
                            : '—'}
                        </span>
                        <span>{p.type || '—'}</span>
                        <span>{p.puppy_name || '—'}</span>
                        <span>
                          {p.amount != null
                            ? `$${p.amount.toFixed(2)}`
                            : '—'}
                        </span>
                        <span>
                          {p.method || '—'}
                          {p.notes ? ` — ${p.notes}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual payment form */}
                <div className="miniForm">
                  <div className="miniFormTitle">Add Payment (manual)</div>
                  <form className="miniFormRow" onSubmit={handleAddPayment}>
                    <select
                      value={newPayType}
                      onChange={(e) => setNewPayType(e.target.value)}
                    >
                      <option value="">Type</option>
                      <option value="deposit">Deposit</option>
                      <option value="payment">Payment</option>
                      <option value="refund">Refund</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={newPayAmount}
                      onChange={(e) => setNewPayAmount(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      value={newPayDate}
                      onChange={(e) => setNewPayDate(e.target.value)}
                    />
                    <select
                      value={newPayPuppyId}
                      onChange={(e) => setNewPayPuppyId(e.target.value)}
                    >
                      <option value="">Puppy (optional)</option>
                      {detail.puppies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || 'Unnamed'}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Method (cash, PayPal...)"
                      value={newPayMethod}
                      onChange={(e) => setNewPayMethod(e.target.value)}
                    />
                    <input
                      placeholder="Notes (optional)"
                      value={newPayNotes}
                      onChange={(e) => setNewPayNotes(e.target.value)}
                    />
                    <button type="submit" disabled={savingPayment}>
                      {savingPayment ? 'Saving…' : 'Save'}
                    </button>
                  </form>
                </div>
              </section>

              {/* Transportation */}
              <section className="detailSection">
                <h3>Transportation</h3>
                {detail.transports.length === 0 && (
                  <div className="emptyLine">No trips recorded.</div>
                )}
                {detail.transports.length > 0 && (
                  <div className="table">
                    <div className="tableHead">
                      <span>Date</span>
                      <span>Route</span>
                      <span>Miles</span>
                      <span>Costs</span>
                    </div>
                    {detail.transports.map((t) => (
                      <div key={t.id} className="tableRow">
                        <span>
                          {t.trip_date ? t.trip_date.slice(0, 10) : '—'}
                        </span>
                        <span>
                          {t.from_location || '—'} → {t.to_location || '—'}
                        </span>
                        <span>
                          {t.miles != null ? t.miles.toFixed(1) : '—'}
                        </span>
                        <span>
                          {[
                            t.tolls || 0,
                            t.hotel_cost || 0,
                            t.fuel_cost || 0,
                          ].some((v) => v > 0)
                            ? `$${(
                                (t.tolls || 0) +
                                (t.hotel_cost || 0) +
                                (t.fuel_cost || 0)
                              ).toFixed(2)}`
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        :root {
          --brand: #e0a96d;
          --brandAlt: #c47a35;
        }
        .buyersWrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }
        .buyersHeader h1 {
          margin: 0 0 4px;
        }
        .buyersHeader .muted {
          margin: 0;
          color: #9ca3af;
        }
        .addBuyerCard {
          background: radial-gradient(
            circle at top left,
            rgba(15, 23, 42, 0.9),
            rgba(15, 23, 42, 1)
          );
          border-radius: 14px;
          padding: 14px 16px;
          border: 1px solid #1f2937;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5);
        }
        .addBuyerCard h2 {
          margin: 0 0 4px;
          font-size: 1.05rem;
        }
        .addBuyerCard .muted {
          margin: 0 0 10px;
          font-size: 0.9rem;
        }
        .addBuyerForm {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .addBuyerForm input {
          flex: 1 1 160px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #f9fafb;
        }
        .addBuyerForm input::placeholder {
          color: #6b7280;
        }
        .addBuyerForm button {
          padding: 8px 14px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          font-weight: 600;
          cursor: pointer;
        }
        .addBuyerForm button:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .errorBanner {
          background: rgba(127, 29, 29, 0.9);
          border: 1px solid #b91c1c;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .buyersMain {
          display: grid;
          grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
          gap: 16px;
          flex: 1;
          min-height: 0;
        }
        .buyersListCard,
        .buyerDetailCard {
          background: rgba(15, 23, 42, 0.96);
          border-radius: 14px;
          border: 1px solid #1f2937;
          padding: 12px 12px 10px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
        }
        .buyersListHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .buyersListHeader h3 {
          margin: 0;
          font-size: 0.95rem;
        }
        .miniTag {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        .buyersList {
          max-height: 420px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .buyerRow {
          width: 100%;
          text-align: left;
          border-radius: 10px;
          border: 1px solid #111827;
          background: #020617;
          padding: 8px 9px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition:
            background 0.12s ease,
            border-color 0.12s ease,
            transform 0.12s ease;
        }
        .buyerRow:hover {
          background: #0b1120;
          transform: translateY(-1px);
        }
        .buyerRow.active {
          border-color: var(--brand);
          box-shadow: 0 0 0 1px rgba(224, 169, 109, 0.4);
        }
        .buyerRowTop {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: baseline;
        }
        .buyerName {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .buyerLocation {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        .buyerRowBottom {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .chip {
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 999px;
          background: #111827;
          color: #e5e7eb;
        }
        .buyerDetailCard {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 0;
        }
        .detailPlaceholder {
          margin: auto;
          color: #9ca3af;
        }
        .buyerDetailHeader h2 {
          margin: 0 0 2px;
        }
        .buyerDetailHeader .muted {
          margin: 0;
          color: #9ca3af;
        }
        .detailSection {
          margin-top: 8px;
        }
        .detailSection h3 {
          margin: 0 0 6px;
          font-size: 0.95rem;
        }
        .detailGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 8px 16px;
          font-size: 0.9rem;
        }
        .label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #9ca3af;
          margin-bottom: 2px;
        }
        .emptyState,
        .emptyLine {
          font-size: 0.9rem;
          color: #9ca3af;
        }
        .table {
          border-radius: 10px;
          border: 1px solid #111827;
          overflow: hidden;
          font-size: 0.88rem;
        }
        .tableHead,
        .tableRow {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.2fr 0.8fr;
          gap: 8px;
          padding: 6px 10px;
        }
        .tableHead {
          background: #020617;
          border-bottom: 1px solid #111827;
          font-weight: 600;
          font-size: 0.82rem;
        }
        .tableRow:nth-child(odd) {
          background: #020617;
        }
        .tableRow:nth-child(even) {
          background: #02061a;
        }
        .table.payments .tableHead,
        .table.payments .tableRow {
          grid-template-columns: 1.1fr 0.9fr 1.1fr 0.8fr 1.6fr;
        }
        .clickableName {
          text-decoration: underline;
          cursor: pointer;
        }
        .miniForm {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #1f2937;
        }
        .miniFormTitle {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        .miniFormRow {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .miniFormRow input,
        .miniFormRow select {
          flex: 1 1 120px;
          min-width: 0;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #f9fafb;
          font-size: 0.8rem;
        }
        .miniFormRow input::placeholder {
          color: #6b7280;
        }
        .miniFormRow button {
          padding: 6px 10px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .miniFormRow button:disabled {
          opacity: 0.7;
          cursor: default;
        }
        @media (max-width: 900px) {
          .buyersMain {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
