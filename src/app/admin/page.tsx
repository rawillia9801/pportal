'use client'

/* ============================================
   CHANGELOG
   - 2025-11-13: Admin shell with LEFT sidebar
   - 2025-11-13: Dashboard landing (cards for activity)
   - 2025-11-13: Buyers tab with manual puppies/payments
   - 2025-11-13: Buyers tab pricing summary
                 (Price, Credits, Admin Fee Financing, Total Paid)
   - 2025-11-13: Payments tab with per-year + grand totals
   ============================================ */

import React, { useEffect, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ============================================
   SUPABASE HELPERS
   ============================================ */

type AnyClient = SupabaseClient<any, 'public', any>
let __sb: AnyClient | null = null

function getSupabaseEnv() {
  const g: any =
    typeof window !== 'undefined' ? (window as any) : (globalThis as any)
  const hasProc =
    typeof process !== 'undefined' &&
    (process as any) &&
    (process as any).env

  const url = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL
    : g.NEXT_PUBLIC_SUPABASE_URL || g.__ENV?.NEXT_PUBLIC_SUPABASE_URL || ''

  const key = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : g.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''

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
   TYPES
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

/* ---- Buyers tab types ---- */

type BuyerRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

type BuyerDetailBuyer = BuyerRow & {
  address_line1?: string | null
  postal_code?: string | null
  notes?: string | null
  base_price?: number | null
  credits?: number | null
  admin_fee_financing?: number | null
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
  buyer: BuyerDetailBuyer
  puppies: PuppySummary[]
  payments: PaymentSummary[]
  transports: TransportSummary[]
}

/* ---- Payments tab types ---- */

type PaymentRow = {
  id: string
  buyer_id: string | null
  buyer_name: string | null
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
}

type YearSummary = {
  year: string
  count: number
  total: number
  depositTotal: number
  paymentTotal: number
  refundTotal: number
}

type PaymentStats = {
  years: YearSummary[]
  grandTotal: number
  grandCount: number
  latestDate: string | null
  byYear: Record<string, PaymentRow[]>
}

/* ---- Dashboard counts ---- */

type DashboardCounts = {
  buyers: number | null
  applications: number | null
  payments: number | null
  messages: number | null
  transports: number | null
}

/* ============================================
   SMALL HELPERS
   ============================================ */

function fmtCurrency(v: number | null | undefined): string {
  const n =
    typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v) ? v : 0
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  // assume YYYY-MM-DD or ISO
  return d.slice(0, 10)
}

/* ============================================
   ROOT ADMIN PAGE
   ============================================ */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard')

  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    background:
      'radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),' +
      'radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),' +
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
          <div style={logoStyle}>🐾</div>
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

        {activeTab === 'payments' && <PaymentsView />}

        {activeTab !== 'dashboard' &&
          activeTab !== 'buyers' &&
          activeTab !== 'payments' && (
            <div className="comingSoon">
              <h1>{ADMIN_TABS.find((t) => t.key === activeTab)?.label}</h1>
              <p>
                This section will be wired after the Buyers and Payments flows
                are finished.
              </p>
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
   DASHBOARD TAB
   ============================================ */

function AdminHomeDashboard({
  onOpenTab,
}: {
  onOpenTab: (t: AdminTabKey) => void
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

        try {
          const res = await sb
            .from('puppy_buyers')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number') next.buyers = res.count
        } catch {}

        try {
          const res = await sb
            .from('puppy_applications')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.applications = res.count
        } catch {}

        try {
          const res = await sb
            .from('puppy_payments')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.payments = res.count
        } catch {}

        try {
          const res = await sb
            .from('puppy_messages')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.messages = res.count
        } catch {}

        try {
          const res = await sb
            .from('transport_requests')
            .select('id', { count: 'exact', head: true })
          if (!res.error && typeof res.count === 'number')
            next.transports = res.count
        } catch {}

        setCounts(next)
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin stats.')
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
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            border-color 0.12s ease, background 0.12s ease;
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
          margin: 4px 0 4px;
          color: #9ca3af;
          font-size: 0.9rem;
        }
        .dashActivity {
          font-size: 0.8rem;
          color: #22c55e;
        }
        .dashFooter {
          margin-top: 4px;
          font-size: 0.85rem;
          color: #e5e7eb;
        }
      `}</style>
    </section>
  )
}

/* ============================================
   BUYERS TAB (with Price / Credits / Total Paid)
   ============================================ */

function BuyersView() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BuyerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add buyer form
  const [newBuyerName, setNewBuyerName] = useState('')
  const [newBuyerEmail, setNewBuyerEmail] = useState('')
  const [newBuyerPhone, setNewBuyerPhone] = useState('')
  const [savingBuyer, setSavingBuyer] = useState(false)

  // Manual puppy form
  const [newPuppyName, setNewPuppyName] = useState('')
  const [newPuppyStatus, setNewPuppyStatus] = useState('reserved')
  const [newPuppyPrice, setNewPuppyPrice] = useState('')

  // Manual payment form
  const [newPayType, setNewPayType] = useState('payment')
  const [newPayAmount, setNewPayAmount] = useState('')
  const [newPayDate, setNewPayDate] = useState('')
  const [newPayPuppy, setNewPayPuppy] = useState('')
  const [newPayMethod, setNewPayMethod] = useState('')

  // Pricing summary fields
  const [priceDraft, setPriceDraft] = useState('')
  const [creditsDraft, setCreditsDraft] = useState('')
  const [adminFeeDraft, setAdminFeeDraft] = useState('')
  const [savingPricing, setSavingPricing] = useState(false)

  // Load buyers list
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const sb = await getBrowserClient()
        const { data, error } = await sb
          .from('puppy_buyers')
          .select(
            'id, full_name, email, phone, city, state, created_at'
          )
          .order('full_name', { ascending: true })
        if (error) throw error
        const rows = (data || []) as BuyerRow[]
        setBuyers(rows)
        if (rows.length && !selectedId) {
          setSelectedId(rows[0].id)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load buyers.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Load detail when selection changes
  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    ;(async () => {
      setDetailLoading(true)
      setError(null)
      try {
        const sb = await getBrowserClient()

        // buyer
        const buyerRes = await sb
          .from('puppy_buyers')
          .select(
            'id, full_name, email, phone, address_line1, city, state, postal_code, notes, base_price, credits, admin_fee_financing, created_at'
          )
          .eq('id', selectedId)
          .single()

        if (buyerRes.error) throw buyerRes.error

        const buyer = buyerRes.data as BuyerDetailBuyer

        // puppies (manual)
        let puppies: PuppySummary[] = []
        try {
          const pupRes = await sb
            .from('puppy_buyer_puppies')
            .select('id, name, status, price')
            .eq('buyer_id', selectedId)
            .order('created_at', { ascending: true })
          if (!pupRes.error && pupRes.data) {
            puppies = pupRes.data as PuppySummary[]
          }
        } catch {}

        // payments
        let payments: PaymentSummary[] = []
        try {
          const payRes = await sb
            .from('puppy_payments')
            .select(
              'id, type, amount, payment_date, method, puppy_name, notes'
            )
            .eq('buyer_id', selectedId)
            .order('payment_date', { ascending: true })
          if (!payRes.error && payRes.data) {
            payments = payRes.data as PaymentSummary[]
          }
        } catch {}

        // transports
        let transports: TransportSummary[] = []
        try {
          const tRes = await sb
            .from('transport_trips')
            .select(
              'id, trip_date, from_location, to_location, miles, tolls, hotel_cost, fuel_cost'
            )
            .eq('buyer_id', selectedId)
            .order('trip_date', { ascending: true })
          if (!tRes.error && tRes.data) {
            transports = tRes.data as TransportSummary[]
          }
        } catch {}

        const detailObj: BuyerDetail = {
          buyer,
          puppies,
          payments,
          transports,
        }
        setDetail(detailObj)

        // Seed pricing drafts
        setPriceDraft(
          buyer.base_price != null && !Number.isNaN(buyer.base_price)
            ? String(buyer.base_price)
            : ''
        )
        setCreditsDraft(
          buyer.credits != null && !Number.isNaN(buyer.credits)
            ? String(buyer.credits)
            : ''
        )
        setAdminFeeDraft(
          buyer.admin_fee_financing != null &&
            !Number.isNaN(buyer.admin_fee_financing)
            ? String(buyer.admin_fee_financing)
            : ''
        )
      } catch (e: any) {
        setError(e?.message || 'Failed to load buyer details.')
      } finally {
        setDetailLoading(false)
      }
    })()
  }, [selectedId])

  async function handleAddBuyer() {
    if (!newBuyerName.trim()) return
    setSavingBuyer(true)
    try {
      const sb = await getBrowserClient()
      const { data, error } = await sb
        .from('puppy_buyers')
        .insert({
          full_name: newBuyerName.trim(),
          email: newBuyerEmail || null,
          phone: newBuyerPhone || null,
        })
        .select(
          'id, full_name, email, phone, city, state, created_at'
        )
        .single()
      if (error) throw error
      const row = data as BuyerRow
      setBuyers((prev) =>
        [...prev, row].sort((a, b) =>
          a.full_name.localeCompare(b.full_name)
        )
      )
      setSelectedId(row.id)
      setNewBuyerName('')
      setNewBuyerEmail('')
      setNewBuyerPhone('')
    } catch (e: any) {
      alert(e?.message || 'Failed to add buyer.')
    } finally {
      setSavingBuyer(false)
    }
  }

  async function handleAddPuppy() {
    if (!detail || !selectedId) return
    if (!newPuppyName.trim()) return
    const priceNum = parseFloat(newPuppyPrice || '0') || 0
    try {
      const sb = await getBrowserClient()
      const { data, error } = await sb
        .from('puppy_buyer_puppies')
        .insert({
          buyer_id: selectedId,
          name: newPuppyName.trim(),
          status: newPuppyStatus,
          price: priceNum,
        })
        .select('id, name, status, price')
        .single()
      if (error) throw error
      const pup = data as PuppySummary
      setDetail({
        ...detail,
        puppies: [...detail.puppies, pup],
      })
      setNewPuppyName('')
      setNewPuppyPrice('')
      setNewPuppyStatus('reserved')
    } catch (e: any) {
      alert(e?.message || 'Failed to add puppy.')
    }
  }

  async function handleAddPayment() {
    if (!detail || !selectedId) return
    const amountNum = parseFloat(newPayAmount || '0')
    if (!amountNum || Number.isNaN(amountNum)) return
    const date = newPayDate || new Date().toISOString().slice(0, 10)
    try {
      const sb = await getBrowserClient()
      const { data, error } = await sb
        .from('puppy_payments')
        .insert({
          buyer_id: selectedId,
          type: newPayType,
          amount: amountNum,
          payment_date: date,
          puppy_name: newPayPuppy || null,
          method: newPayMethod || null,
        })
        .select(
          'id, type, amount, payment_date, method, puppy_name, notes'
        )
        .single()
      if (error) throw error
      const pay = data as PaymentSummary
      setDetail({
        ...detail,
        payments: [...detail.payments, pay],
      })
      setNewPayAmount('')
      setNewPayDate('')
      setNewPayMethod('')
      setNewPayPuppy('')
      setNewPayType('payment')
    } catch (e: any) {
      alert(e?.message || 'Failed to add payment.')
    }
  }

  async function handleSavePricing() {
    if (!detail || !detail.buyer.id) return
    setSavingPricing(true)
    try {
      const base_price = parseFloat(priceDraft || '0') || 0
      const credits = parseFloat(creditsDraft || '0') || 0
      const admin_fee_financing =
        parseFloat(adminFeeDraft || '0') || 0

      const sb = await getBrowserClient()
      const { error } = await sb
        .from('puppy_buyers')
        .update({ base_price, credits, admin_fee_financing })
        .eq('id', detail.buyer.id)
      if (error) throw error

      setDetail({
        ...detail,
        buyer: {
          ...detail.buyer,
          base_price,
          credits,
          admin_fee_financing,
        },
      })
    } catch (e: any) {
      alert(e?.message || 'Failed to save pricing.')
    } finally {
      setSavingPricing(false)
    }
  }

  const totalPaid = (detail?.payments || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  )
  const puppiesTotal = (detail?.puppies || []).reduce(
    (sum, p) => sum + (p.price || 0),
    0
  )
  const basePrice = detail?.buyer.base_price || 0
  const credits = detail?.buyer.credits || 0
  const adminFee = detail?.buyer.admin_fee_financing || 0
  const effectivePrice = basePrice > 0 ? basePrice : puppiesTotal
  const balance = effectivePrice + adminFee - credits - totalPaid

  return (
    <section className="buyersWrap">
      <header className="buyersHeader">
        <h1>Buyers</h1>
        <p className="muted">
          Manage approved families, their puppies, payment history, and
          transportation details.
        </p>
      </header>

      {/* Add buyer strip */}
      <div className="addBuyer">
        <div className="addBuyerTitle">Add Buyer</div>
        <div className="addBuyerSubtitle">
          You can also auto-create buyers later from approved
          applications.
        </div>
        <div className="addBuyerRow">
          <input
            placeholder="Full name"
            value={newBuyerName}
            onChange={(e) => setNewBuyerName(e.target.value)}
          />
          <input
            placeholder="Email (optional)"
            value={newBuyerEmail}
            onChange={(e) => setNewBuyerEmail(e.target.value)}
          />
          <input
            placeholder="Phone (optional)"
            value={newBuyerPhone}
            onChange={(e) => setNewBuyerPhone(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddBuyer}
            disabled={savingBuyer || !newBuyerName.trim()}
          >
            {savingBuyer ? 'Saving…' : 'Save Buyer'}
          </button>
        </div>
      </div>

      <div className="buyersLayout">
        {/* LEFT LIST */}
        <aside className="buyersList">
          <div className="listTitle">All Buyers</div>
          {loading && <div className="listEmpty">Loading…</div>}
          {!loading && !buyers.length && (
            <div className="listEmpty">No buyers yet.</div>
          )}
          {!loading &&
            buyers.map((b) => (
              <button
                key={b.id}
                type="button"
                className={
                  'buyerItem ' + (b.id === selectedId ? 'active' : '')
                }
                onClick={() => setSelectedId(b.id)}
              >
                <div className="buyerName">{b.full_name}</div>
                <div className="buyerSub">
                  {b.city && b.state ? `${b.city}, ${b.state}` : '—'}
                </div>
              </button>
            ))}
        </aside>

        {/* RIGHT DETAIL */}
        <div className="buyersDetail">
          {error && <div className="detailError">{error}</div>}
          {detailLoading && !detail && (
            <div className="detailEmpty">Loading buyer…</div>
          )}
          {!detailLoading && !detail && (
            <div className="detailEmpty">
              Select a buyer on the left to view details.
            </div>
          )}
          {detail && (
            <>
              <h2>{detail.buyer.full_name}</h2>
              <div className="sectionLabel">Buyer details</div>

              {/* CONTACT */}
              <div className="contactGrid">
                <div>
                  <div className="fieldLabel">Email</div>
                  <div className="fieldValue">
                    {detail.buyer.email || '—'}
                  </div>
                </div>
                <div>
                  <div className="fieldLabel">Phone</div>
                  <div className="fieldValue">
                    {detail.buyer.phone || '—'}
                  </div>
                </div>
                <div>
                  <div className="fieldLabel">Address</div>
                  <div className="fieldValue">
                    {detail.buyer.address_line1 ||
                    detail.buyer.city ||
                    detail.buyer.state
                      ? [
                          detail.buyer.address_line1,
                          detail.buyer.city,
                          detail.buyer.state,
                          detail.buyer.postal_code,
                        ]
                          .filter(Boolean)
                          .join(', ')
                      : '—'}
                  </div>
                </div>
              </div>

              {/* PUPPIES */}
              <div className="sectionBlock">
                <div className="sectionLabel">Puppies</div>
                {detail.puppies.length === 0 && (
                  <div className="fieldValue">
                    No puppies assigned yet.
                  </div>
                )}
                {detail.puppies.length > 0 && (
                  <table className="simpleTable">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.puppies.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name || '—'}</td>
                          <td>{p.status || '—'}</td>
                          <td>{fmtCurrency(p.price || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="subLabel">Add Puppy (manual)</div>
                <div className="rowInputs">
                  <input
                    placeholder="Name"
                    value={newPuppyName}
                    onChange={(e) => setNewPuppyName(e.target.value)}
                  />
                  <select
                    value={newPuppyStatus}
                    onChange={(e) => setNewPuppyStatus(e.target.value)}
                  >
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="in-care">In care</option>
                  </select>
                  <input
                    placeholder="Price"
                    value={newPuppyPrice}
                    onChange={(e) => setNewPuppyPrice(e.target.value)}
                  />
                  <button type="button" onClick={handleAddPuppy}>
                    Save
                  </button>
                </div>
              </div>

              {/* PAYMENTS + SUMMARY */}
              <div className="sectionBlock">
                <div className="sectionLabel">Payments</div>

                {/* SUMMARY ROW */}
                <div className="paySummary">
                  <div className="payCol">
                    <label>Price</label>
                    <input
                      value={priceDraft}
                      onChange={(e) => setPriceDraft(e.target.value)}
                      placeholder={
                        puppiesTotal > 0
                          ? `Default from puppies: ${fmtCurrency(
                              puppiesTotal
                            )}`
                          : '0.00'
                      }
                    />
                  </div>
                  <div className="payCol">
                    <label>Credits</label>
                    <input
                      value={creditsDraft}
                      onChange={(e) => setCreditsDraft(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="payCol">
                    <label>Admin Fee Financing</label>
                    <input
                      value={adminFeeDraft}
                      onChange={(e) => setAdminFeeDraft(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="payCol readonly">
                    <label>Total Paid</label>
                    <div className="summaryValue">
                      {fmtCurrency(totalPaid)}
                    </div>
                  </div>
                </div>
                <div className="paySummaryFooter">
                  <button
                    type="button"
                    onClick={handleSavePricing}
                    disabled={savingPricing}
                  >
                    {savingPricing ? 'Saving…' : 'Save Pricing'}
                  </button>
                  <div className="balanceText">
                    Balance:{' '}
                    <span>
                      {fmtCurrency(
                        Number.isFinite(balance) ? balance : 0
                      )}
                    </span>
                  </div>
                </div>

                {/* PAYMENTS TABLE */}
                {detail.payments.length === 0 && (
                  <div className="fieldValue">
                    No payments recorded.
                  </div>
                )}
                {detail.payments.length > 0 && (
                  <table className="simpleTable">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Puppy</th>
                        <th>Amount</th>
                        <th>Method / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{fmtDate(p.payment_date)}</td>
                          <td>{p.type || '—'}</td>
                          <td>{p.puppy_name || '—'}</td>
                          <td>{fmtCurrency(p.amount || 0)}</td>
                          <td>{p.method || p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="subLabel">Add Payment (manual)</div>
                <div className="rowInputs">
                  <select
                    value={newPayType}
                    onChange={(e) => setNewPayType(e.target.value)}
                  >
                    <option value="deposit">Deposit</option>
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                  </select>
                  <input
                    placeholder="Amount"
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(e.target.value)}
                  />
                  <input
                    type="date"
                    value={newPayDate}
                    onChange={(e) => setNewPayDate(e.target.value)}
                  />
                  <input
                    placeholder="Puppy (optional)"
                    value={newPayPuppy}
                    onChange={(e) => setNewPayPuppy(e.target.value)}
                  />
                  <input
                    placeholder="Method / Notes"
                    value={newPayMethod}
                    onChange={(e) => setNewPayMethod(e.target.value)}
                  />
                  <button type="button" onClick={handleAddPayment}>
                    Save
                  </button>
                </div>
              </div>

              {/* TRANSPORT */}
              <div className="sectionBlock">
                <div className="sectionLabel">Transportation</div>
                {detail.transports.length === 0 && (
                  <div className="fieldValue">
                    No trips recorded.
                  </div>
                )}
                {detail.transports.length > 0 && (
                  <table className="simpleTable">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Route</th>
                        <th>Miles</th>
                        <th>Tolls</th>
                        <th>Hotel</th>
                        <th>Fuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.transports.map((t) => (
                        <tr key={t.id}>
                          <td>{fmtDate(t.trip_date)}</td>
                          <td>
                            {t.from_location || '—'} →{' '}
                            {t.to_location || '—'}
                          </td>
                          <td>{t.miles ?? '—'}</td>
                          <td>{fmtCurrency(t.tolls || 0)}</td>
                          <td>{fmtCurrency(t.hotel_cost || 0)}</td>
                          <td>{fmtCurrency(t.fuel_cost || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .buyersWrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .buyersHeader h1 {
          margin: 0 0 4px;
        }
        .buyersHeader .muted {
          margin: 0;
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .addBuyer {
          border-radius: 14px;
          border: 1px solid #1f2937;
          background: radial-gradient(circle at top left, #020617, #020617);
          padding: 10px 12px 12px;
        }
        .addBuyerTitle {
          font-weight: 600;
          margin-bottom: 2px;
        }
        .addBuyerSubtitle {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-bottom: 6px;
        }
        .addBuyerRow {
          display: grid;
          grid-template-columns: 1.3fr 1.1fr 1.1fr auto;
          gap: 8px;
        }
        .addBuyerRow input {
          background: #020617;
          border-radius: 8px;
          border: 1px solid #1f2937;
          padding: 7px 8px;
          color: #f9fafb;
          font-size: 0.9rem;
        }
        .addBuyerRow button {
          border-radius: 8px;
          border: 1px solid #e0a96d;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
          font-weight: 600;
          padding: 7px 10px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .buyersLayout {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 16px;
        }
        .buyersList {
          border-radius: 14px;
          border: 1px solid #1f2937;
          background: #020617;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .listTitle {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .listEmpty {
          font-size: 0.9rem;
          color: #9ca3af;
          padding: 4px 2px;
        }
        .buyerItem {
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #020617;
          text-align: left;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .buyerItem.active {
          border-color: #e0a96d;
          background: radial-gradient(circle at top left, #111827, #020617);
        }
        .buyerName {
          font-weight: 500;
        }
        .buyerSub {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        .buyersDetail {
          border-radius: 14px;
          border: 1px solid #1f2937;
          background: radial-gradient(circle at top left, #020617, #020617);
          padding: 14px 14px 16px;
        }
        .buyersDetail h2 {
          margin: 0 0 4px;
        }
        .detailEmpty {
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .detailError {
          background: rgba(127, 29, 29, 0.9);
          border: 1px solid #b91c1c;
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        .sectionLabel {
          margin-top: 10px;
          margin-bottom: 4px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .sectionBlock {
          margin-top: 10px;
        }
        .contactGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }
        .fieldLabel {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .fieldValue {
          font-size: 0.9rem;
        }
        .simpleTable {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 0.9rem;
        }
        .simpleTable th,
        .simpleTable td {
          border-bottom: 1px solid #1f2937;
          padding: 4px 4px;
          text-align: left;
        }
        .simpleTable th {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }
        .subLabel {
          margin-top: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #9ca3af;
        }
        .rowInputs {
          margin-top: 4px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 6px;
        }
        .rowInputs input,
        .rowInputs select {
          background: #020617;
          border-radius: 8px;
          border: 1px solid #1f2937;
          padding: 6px 8px;
          color: #f9fafb;
          font-size: 0.85rem;
        }
        .rowInputs button {
          border-radius: 8px;
          border: 1px solid #e0a96d;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
          font-weight: 600;
          padding: 6px 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .paySummary {
          margin-top: 6px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }
        .payCol label {
          display: block;
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .payCol input {
          width: 100%;
          background: #020617;
          border-radius: 8px;
          border: 1px solid #1f2937;
          padding: 6px 8px;
          color: #f9fafb;
          font-size: 0.85rem;
        }
        .payCol.readonly .summaryValue {
          border-radius: 8px;
          border: 1px dashed #1f2937;
          padding: 7px 8px;
          font-size: 0.9rem;
        }
        .paySummaryFooter {
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .paySummaryFooter button {
          border-radius: 8px;
          border: 1px solid #e0a96d;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
          font-weight: 600;
          padding: 6px 10px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .balanceText {
          font-size: 0.9rem;
          color: #e5e7eb;
        }
        .balanceText span {
          font-weight: 600;
        }
      `}</style>
    </section>
  )
}

/* ============================================
   PAYMENTS TAB (per-year + grand totals)
   ============================================ */

function PaymentsView() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [activeYear, setActiveYear] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const sb = await getBrowserClient()
        const { data, error } = await sb
          .from('puppy_payments')
          .select('id, buyer_id, type, amount, payment_date, method')
          .order('payment_date', { ascending: false })
        if (error) throw error

        const rowsRaw = (data || []) as any[]

        // Get buyer names
        const buyerIds = Array.from(
          new Set(
            rowsRaw
              .map((r) => r.buyer_id as string | null)
              .filter(Boolean)
          )
        )
        let buyerNameMap = new Map<string, string>()
        if (buyerIds.length) {
          const buyersRes = await sb
            .from('puppy_buyers')
            .select('id, full_name')
            .in('id', buyerIds)
          if (!buyersRes.error && buyersRes.data) {
            for (const b of buyersRes.data as any[]) {
              buyerNameMap.set(b.id as string, b.full_name as string)
            }
          }
        }

        const rows: PaymentRow[] = rowsRaw.map((r) => ({
          id: String(r.id),
          buyer_id: r.buyer_id ?? null,
          buyer_name: r.buyer_id ? buyerNameMap.get(r.buyer_id) || null : null,
          type: r.type ?? null,
          amount: typeof r.amount === 'number' ? r.amount : null,
          payment_date: r.payment_date ?? null,
          method: r.method ?? null,
        }))

        const byYear: Record<string, PaymentRow[]> = {}
        const yearMap: Record<string, YearSummary> = {}

        let grandTotal = 0
        let grandCount = 0
        let latestDate: string | null = null

        for (const row of rows) {
          const year =
            row.payment_date && row.payment_date.length >= 4
              ? row.payment_date.slice(0, 4)
              : 'Unknown'
          if (!byYear[year]) byYear[year] = []
          byYear[year].push(row)

          const amount = row.amount || 0
          grandTotal += amount
          grandCount += 1

          if (!yearMap[year]) {
            yearMap[year] = {
              year,
              count: 0,
              total: 0,
              depositTotal: 0,
              paymentTotal: 0,
              refundTotal: 0,
            }
          }
          const ys = yearMap[year]
          ys.count += 1
          ys.total += amount

          const kind = (row.type || '').toLowerCase()
          if (kind === 'deposit') ys.depositTotal += amount
          else if (kind === 'refund') ys.refundTotal += amount
          else ys.paymentTotal += amount

          if (row.payment_date) {
            if (!latestDate || row.payment_date > latestDate) {
              latestDate = row.payment_date
            }
          }
        }

        const years = Object.values(yearMap).sort((a, b) =>
          a.year < b.year ? 1 : -1
        )

        const statObj: PaymentStats = {
          years,
          grandTotal,
          grandCount,
          latestDate,
          byYear,
        }
        setStats(statObj)
        if (!activeYear && years.length) {
          setActiveYear(years[0].year)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load payments.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const activeRows =
    activeYear && stats ? stats.byYear[activeYear] || [] : []

  return (
    <section className="payWrap">
      <header className="payHeader">
        <div>
          <h1>Payments</h1>
          <p className="muted">
            Breakdown of deposits, payments, and refunds by year, with
            grand totals for your program.
          </p>
        </div>
      </header>

      {error && <div className="payError">{error}</div>}
      {loading && <div className="payEmpty">Loading payments…</div>}

      {stats && (
        <>
          <div className="paySummaryRow">
            <div className="summaryCard">
              <div className="summaryLabel">Grand Total</div>
              <div className="summaryValue">
                {fmtCurrency(stats.grandTotal)}
              </div>
              <div className="summarySub">
                {stats.grandCount} payments recorded
              </div>
            </div>
            <div className="summaryCard">
              <div className="summaryLabel">Latest Payment</div>
              <div className="summaryValue">
                {fmtDate(stats.latestDate)}
              </div>
              <div className="summarySub">Most recent payment date</div>
            </div>
          </div>

          <div className="yearChips">
            {stats.years.map((y) => (
              <button
                key={y.year}
                type="button"
                className={
                  'yearChip ' + (y.year === activeYear ? 'active' : '')
                }
                onClick={() => setActiveYear(y.year)}
              >
                <div className="chipYear">{y.year}</div>
                <div className="chipLine">
                  {y.count} payments · {fmtCurrency(y.total)}
                </div>
                <div className="chipBreakdown">
                  D {fmtCurrency(y.depositTotal)} · P{' '}
                  {fmtCurrency(y.paymentTotal)} · R{' '}
                  {fmtCurrency(y.refundTotal)}
                </div>
              </button>
            ))}
          </div>

          <div className="payTableBlock">
            <h2>
              {activeYear ? `Payments in ${activeYear}` : 'Payments'}
            </h2>
            {!activeRows.length && (
              <div className="payEmpty">No payments for this year.</div>
            )}
            {activeRows.length > 0 && (
              <table className="simpleTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((r) => (
                    <tr key={r.id}>
                      <td>{fmtDate(r.payment_date)}</td>
                      <td>{r.buyer_name || '—'}</td>
                      <td>{r.type || '—'}</td>
                      <td>{fmtCurrency(r.amount || 0)}</td>
                      <td>{r.method || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .payWrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .payHeader h1 {
          margin: 0 0 4px;
        }
        .payHeader .muted {
          margin: 0;
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .payError {
          background: rgba(127, 29, 29, 0.9);
          border: 1px solid #b91c1c;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .payEmpty {
          font-size: 0.9rem;
          color: #9ca3af;
        }
        .paySummaryRow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
        .summaryCard {
          border-radius: 12px;
          border: 1px solid #1f2937;
          background: radial-gradient(circle at top left, #020617, #020617);
          padding: 10px 12px;
        }
        .summaryLabel {
          font-size: 0.8rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .summaryValue {
          font-size: 1.2rem;
          font-weight: 600;
        }
        .summarySub {
          margin-top: 2px;
          font-size: 0.85rem;
          color: #9ca3af;
        }
        .yearChips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .yearChip {
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #020617;
          padding: 6px 8px;
          font-size: 0.85rem;
          text-align: left;
          cursor: pointer;
        }
        .yearChip.active {
          border-color: #e0a96d;
          background: radial-gradient(circle at top left, #111827, #020617);
        }
        .chipYear {
          font-weight: 600;
        }
        .chipLine {
          font-size: 0.8rem;
          color: #e5e7eb;
        }
        .chipBreakdown {
          font-size: 0.78rem;
          color: #9ca3af;
        }
        .payTableBlock h2 {
          margin: 6px 0;
        }
        .simpleTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .simpleTable th,
        .simpleTable td {
          border-bottom: 1px solid #1f2937;
          padding: 4px 4px;
          text-align: left;
        }
        .simpleTable th {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }
      `}</style>
    </section>
  )
}
