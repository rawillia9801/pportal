'use client'

/* ============================================
   CHANGELOG
   - 2025-11-13: Admin shell with LEFT sidebar
   - 2025-11-13: Dashboard landing (cards for activity)
   - 2025-11-13: Buyers tab with manual puppies/payments/transport
   - 2025-11-13: Buyers tab financial at-a-glance summary
                 (Price, Credits, Admin Fee Financing, Total Paid, Balance)
   - 2025-11-13: Payments tab with per-year + grand totals
   - 2025-11-13: Sidebar tab buttons enlarged for easier click
   - 2025-11-14: Added Supabase auth gate using shared getBrowserClient.
                 /admin now requires a valid session (and optional admin email).
   ============================================ */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase/client'

/* ============================================
   ADMIN ACCESS CONFIG
   ============================================ */

// Optional: set a comma-separated list in Vercel, e.g.:
// NEXT_PUBLIC_ADMIN_EMAILS="feedback@chihuahuahq.com,swvac@yourdomain.com"
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  if (ADMIN_EMAILS.length === 0) {
    // No list configured → any logged-in user can see /admin
    return true
  }
  return ADMIN_EMAILS.includes(email.toLowerCase())
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
}

type PaymentSummary = {
  id: string
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
  notes: string | null
  puppy_id: string | null
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
  notes: string | null
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
  return d.slice(0, 10)
}

/* ============================================
   ROOT ADMIN PAGE (WITH AUTH GATE)
   ============================================ */

export default function AdminPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ready'>('checking')
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard')

  useEffect(() => {
    const supabase = getBrowserClient()
    let cancelled = false

    ;(async () => {
      const { data, error } = await supabase.auth.getUser()
      if (cancelled) return

      const u = data?.user ?? null

      // Not logged in → send to login
      if (error || !u) {
        router.replace('/login?reason=admin')
        return
      }

      // Logged in but not allowed (if ADMIN_EMAILS configured)
      if (!isAllowedAdmin(u.email)) {
        router.replace('/dashboard')
        return
      }

      setUser(u)
      setStatus('ready')
    })()

    return () => {
      cancelled = true
    }
  }, [router])

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
    width: 250,
    padding: '18px 14px',
    boxSizing: 'border-box',
    borderRight: '1px solid #1f2937',
    background: 'linear-gradient(180deg,#020617,#020617,#111827)',
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
    gap: 8,
  }

  // ENLARGED TAB BUTTONS
  const tabBaseStyle: React.CSSProperties = {
    border: '1px solid #1f2937',
    background: '#020617',
    color: '#e5e7eb',
    borderRadius: 12,
    padding: '11px 13px',
    textAlign: 'left',
    fontSize: '0.95rem',
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
    boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '20px 22px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  }

  if (status === 'checking') {
    return (
      <main style={layoutStyle}>
        <section
          style={{
            margin: 'auto',
            textAlign: 'center',
            color: '#e5e7eb',
          }}
        >
          <h1 style={{ marginBottom: 8 }}>Checking admin access…</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Verifying your Southwest Virginia Chihuahua admin session.
          </p>
        </section>
      </main>
    )
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
            {user?.email && (
              <div style={{ fontSize: '.7rem', color: '#9ca3af' }}>
                {user.email}
              </div>
            )}
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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const sb = getBrowserClient()

      async function safeCount(table: string): Promise<number | null> {
        try {
          const { count, error } = await sb
            .from(table)
            .select('id', { count: 'exact', head: true })
          if (error) return null
          return count ?? null
        } catch {
          return null
        }
      }

      const [buyers, applications, payments, messages, transports] =
        await Promise.all([
          safeCount('puppy_buyers'),
          safeCount('puppy_applications'),
          safeCount('puppy_payments'),
          safeCount('puppy_messages'),
          safeCount('puppy_transport'),
        ])

      if (!cancelled) {
        setCounts({ buyers, applications, payments, messages, transports })
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const cards: {
    label: string
    key: AdminTabKey
    value: number | null
    accent: string
    helper?: string
  }[] = [
    {
      label: 'Buyers',
      key: 'buyers',
      value: counts.buyers,
      accent: '#e0a96d',
      helper: 'Approved families in the system',
    },
    {
      label: 'Applications',
      key: 'applications',
      value: counts.applications,
      accent: '#38bdf8',
      helper: 'Pending & approved',
    },
    {
      label: 'Payments',
      key: 'payments',
      value: counts.payments,
      accent: '#22c55e',
      helper: 'Recorded payments',
    },
    {
      label: 'Messages',
      key: 'messages',
      value: counts.messages,
      accent: '#a855f7',
      helper: 'Conversations with buyers',
    },
    {
      label: 'Transport Requests',
      key: 'transport',
      value: counts.transports,
      accent: '#f97316',
      helper: 'Trips to plan',
    },
  ]

  return (
    <>
      <h1 style={{ marginBottom: 10 }}>Admin Dashboard</h1>
      <p style={{ color: '#9ca3af', marginBottom: 22 }}>
        Quick overview of what&apos;s happening in your Chihuahua program
        today. Click any card to jump straight into that section.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
          gap: 16,
        }}
      >
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onOpenTab(c.key)}
            style={{
              borderRadius: 16,
              border: '1px solid #1f2937',
              padding: '14px 14px',
              background:
                'radial-gradient(80% 200% at 0 0, rgba(224,169,109,0.22), transparent 55%), #020617',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
              transition:
                'transform .12s ease, box-shadow .12s ease, border-color .12s ease',
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.06,
                color: '#9ca3af',
                marginBottom: 4,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: c.accent,
                marginBottom: 4,
              }}
            >
              {loading ? '—' : c.value ?? '—'}
            </div>
            {c.helper && (
              <div style={{ fontSize: 12, color: '#6b7280' }}>{c.helper}</div>
            )}
          </button>
        ))}
      </div>
    </>
  )
}

/* ============================================
   BUYERS TAB
   ============================================ */

function BuyersView() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BuyerDetail | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add buyer form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // Edit financials
  const [priceEdit, setPriceEdit] = useState<string>('')
  const [creditsEdit, setCreditsEdit] = useState<string>('')
  const [adminFeeEdit, setAdminFeeEdit] = useState<string>('')
  const [savingFinancials, setSavingFinancials] = useState(false)

  // Manual puppy
  const [puppyName, setPuppyName] = useState('')
  const [puppyStatus, setPuppyStatus] = useState('reserved')
  const [puppyPrice, setPuppyPrice] = useState('')

  // Manual payment
  const [payType, setPayType] = useState('payment')
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState('')
  const [payNotes, setPayNotes] = useState('')

  // Manual transport
  const [tripDate, setTripDate] = useState('')
  const [tripFrom, setTripFrom] = useState('')
  const [tripTo, setTripTo] = useState('')
  const [tripMiles, setTripMiles] = useState('')
  const [tripTolls, setTripTolls] = useState('')
  const [tripHotel, setTripHotel] = useState('')
  const [tripFuel, setTripFuel] = useState('')
  const [tripNotes, setTripNotes] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingList(true)
      setError(null)
      try {
        const sb = getBrowserClient()
        const { data, error } = await sb
          .from('puppy_buyers')
          .select('id, full_name, email, phone, city, state, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!cancelled) {
          setBuyers((data ?? []) as BuyerRow[])
          if ((data ?? []).length && !selectedId) {
            setSelectedId((data ?? [])[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load buyers list.')
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingDetail(true)
      setError(null)
      try {
        const sb = getBrowserClient()

        const buyerRes = await sb
          .from('puppy_buyers')
          .select(
            'id, full_name, email, phone, city, state, address_line1, postal_code, notes, base_price, credits, admin_fee_financing, created_at'
          )
          .eq('id', selectedId)
          .maybeSingle()

        if (buyerRes.error) throw buyerRes.error
        if (!buyerRes.data) throw new Error('Buyer not found')

        const puppiesRes = await sb
          .from('puppies')
          .select('id, buyer_id, name, status, price')
          .eq('buyer_id', selectedId)
          .order('name', { ascending: true })

        const paymentsRes = await sb
          .from('puppy_payments')
          .select(
            'id, buyer_id, puppy_id, type, amount, payment_date, method, notes'
          )
          .eq('buyer_id', selectedId)
          .order('payment_date', { ascending: false })

        const transportsRes = await sb
          .from('puppy_transport')
          .select(
            'id, buyer_id, puppy_id, trip_date, from_location, to_location, miles, tolls, hotel_cost, fuel_cost, notes'
          )
          .eq('buyer_id', selectedId)
          .order('trip_date', { ascending: false })

        const buyer = buyerRes.data as BuyerDetailBuyer
        const puppies =
          (puppiesRes.data ?? []) as unknown as PuppySummary[]
        const payments =
          (paymentsRes.data ?? []) as unknown as PaymentSummary[]
        const transports =
          (transportsRes.data ?? []) as unknown as TransportSummary[]

        if (!cancelled) {
          setDetail({ buyer, puppies, payments, transports })
          setPriceEdit(
            buyer.base_price != null ? String(buyer.base_price) : ''
          )
          setCreditsEdit(
            buyer.credits != null ? String(buyer.credits) : ''
          )
          setAdminFeeEdit(
            buyer.admin_fee_financing != null
              ? String(buyer.admin_fee_financing)
              : ''
          )
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load buyer details.')
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedId])

  async function handleAddBuyer() {
    if (!newName.trim()) return
    try {
      const sb = getBrowserClient()
      const { data, error } = await sb
        .from('puppy_buyers')
        .insert({
          full_name: newName.trim(),
          email: newEmail.trim() || null,
          phone: newPhone.trim() || null,
        })
        .select('id, full_name, email, phone, city, state, created_at')
        .single()
      if (error) throw error
      setBuyers((prev) => [data as BuyerRow, ...prev])
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      setSelectedId(data.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to add buyer.')
    }
  }

  async function handleSaveFinancials() {
    if (!detail) return
    try {
      setSavingFinancials(true)
      const sb = getBrowserClient()
      const base_price = priceEdit ? Number(priceEdit) : null
      const credits = creditsEdit ? Number(creditsEdit) : null
      const admin_fee_financing = adminFeeEdit
        ? Number(adminFeeEdit)
        : null

      const { error } = await sb
        .from('puppy_buyers')
        .update({ base_price, credits, admin_fee_financing })
        .eq('id', detail.buyer.id)
      if (error) throw error

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              buyer: {
                ...prev.buyer,
                base_price,
                credits,
                admin_fee_financing,
              },
            }
          : prev
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to save financial summary.')
    } finally {
      setSavingFinancials(false)
    }
  }

  async function handleAddPuppy() {
    if (!detail || !puppyName.trim()) return
    try {
      const sb = getBrowserClient()
      const price = puppyPrice ? Number(puppyPrice) : null
      const { data, error } = await sb
        .from('puppies')
        .insert({
          buyer_id: detail.buyer.id,
          name: puppyName.trim(),
          status: puppyStatus || null,
          price,
        })
        .select('id, buyer_id, name, status, price')
        .single()
      if (error) throw error

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              puppies: [
                ...(prev.puppies || []),
                data as unknown as PuppySummary,
              ],
            }
          : prev
      )
      setPuppyName('')
      setPuppyPrice('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add puppy.')
    }
  }

  async function handleAddPayment() {
    if (!detail || !payAmount.trim()) return
    try {
      const sb = getBrowserClient()
      const amount = Number(payAmount)
      const { data, error } = await sb
        .from('puppy_payments')
        .insert({
          buyer_id: detail.buyer.id,
          type: payType || null,
          amount,
          payment_date: payDate || null,
          method: payMethod || null,
          notes: payNotes || null,
        })
        .select(
          'id, buyer_id, puppy_id, type, amount, payment_date, method, notes'
        )
        .single()
      if (error) throw error

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              payments: [
                data as unknown as PaymentSummary,
                ...(prev.payments || []),
              ],
            }
          : prev
      )
      setPayAmount('')
      setPayDate('')
      setPayMethod('')
      setPayNotes('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add payment.')
    }
  }

  async function handleAddTransport() {
    if (!detail || !tripDate.trim()) return
    try {
      const sb = getBrowserClient()
      const miles = tripMiles ? Number(tripMiles) : null
      const tolls = tripTolls ? Number(tripTolls) : null
      const hotel_cost = tripHotel ? Number(tripHotel) : null
      const fuel_cost = tripFuel ? Number(tripFuel) : null

      const { data, error } = await sb
        .from('puppy_transport')
        .insert({
          buyer_id: detail.buyer.id,
          trip_date: tripDate,
          from_location: tripFrom || null,
          to_location: tripTo || null,
          miles,
          tolls,
          hotel_cost,
          fuel_cost,
          notes: tripNotes || null,
        })
        .select(
          'id, buyer_id, puppy_id, trip_date, from_location, to_location, miles, tolls, hotel_cost, fuel_cost, notes'
        )
        .single()
      if (error) throw error

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              transports: [
                data as unknown as TransportSummary,
                ...(prev.transports || []),
              ],
            }
          : prev
      )
      setTripDate('')
      setTripFrom('')
      setTripTo('')
      setTripMiles('')
      setTripTolls('')
      setTripHotel('')
      setTripFuel('')
      setTripNotes('')
    } catch (e: any) {
      setError(e?.message || 'Failed to add transport record.')
    }
  }

  const totalPaid =
    detail?.payments?.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0
    ) ?? 0
  const basePrice = detail?.buyer.base_price ?? 0
  const credits = detail?.buyer.credits ?? 0
  const adminFee = detail?.buyer.admin_fee_financing ?? 0
  const grandPrice = basePrice + adminFee - credits
  const balance = grandPrice - totalPaid

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Buyers</h1>
      <p style={{ color: '#9ca3af', marginBottom: 20 }}>
        Manage your approved families, their puppies, payment history, and
        transportation details. You can also auto-create buyers later from
        approved applications.
      </p>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: BUYER LIST & ADD FORM */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #1f2937',
            background: '#020617',
            padding: 14,
            boxShadow: '0 10px 26px rgba(0,0,0,0.6)',
            height: 'calc(100vh - 170px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Add Buyer
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#9ca3af',
              marginBottom: 6,
            }}
          >
            You can also auto-create buyers later from approved applications.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Email (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleAddBuyer}
              style={primaryBtnStyle}
            >
              Save Buyer
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              fontWeight: 600,
              borderTop: '1px solid #111827',
              paddingTop: 10,
            }}
          >
            All Buyers
          </div>

          <div
            style={{
              marginTop: 6,
              overflowY: 'auto',
              flex: 1,
              paddingRight: 4,
            }}
          >
            {loadingList && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Loading buyers…
              </div>
            )}
            {!loadingList && buyers.length === 0 && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                No buyers added yet.
              </div>
            )}
            {buyers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 10,
                  border:
                    selectedId === b.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  background:
                    selectedId === b.id ? '#111827' : 'transparent',
                  padding: '8px 9px',
                  marginBottom: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600 }}>{b.full_name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {b.email || '—'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: BUYER DETAIL */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #1f2937',
            background: '#020617',
            padding: 16,
            boxShadow: '0 10px 26px rgba(0,0,0,0.6)',
            minHeight: 420,
          }}
        >
          {loadingDetail && !detail && (
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Loading buyer details…
            </div>
          )}
          {!loadingDetail && !detail && (
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Select a buyer on the left to view their details.
            </div>
          )}
          {detail && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {detail.buyer.full_name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: '#6b7280' }}
                  >{`Buyer details`}</div>
                </div>
                <div style={{ fontSize: 11, color: '#4b5563' }}>
                  Buyer since {fmtDate(detail.buyer.created_at)}
                </div>
              </div>

              {/* AT-A-GLANCE FINANCIAL SUMMARY */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(150px,1fr))',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <SummaryPill label="Price" value={fmtCurrency(basePrice)} />
                <SummaryPill
                  label="Credits"
                  value={fmtCurrency(credits)}
                />
                <SummaryPill
                  label="Admin Fee Financing"
                  value={fmtCurrency(adminFee)}
                />
                <SummaryPill
                  label="Total Paid"
                  value={fmtCurrency(totalPaid)}
                  accent="#22c55e"
                />
                <SummaryPill
                  label="Balance"
                  value={fmtCurrency(balance)}
                  accent={balance > 0 ? '#f97316' : '#22c55e'}
                />
              </div>

              {/* FINANCIAL EDIT STRIP */}
              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid #1f2937',
                  padding: 10,
                  marginBottom: 18,
                  background: '#020617',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Edit financial summary
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(140px,1fr))',
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={labelSm}>Price</div>
                    <input
                      type="number"
                      value={priceEdit}
                      onChange={(e) => setPriceEdit(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div style={labelSm}>Credits</div>
                    <input
                      type="number"
                      value={creditsEdit}
                      onChange={(e) => setCreditsEdit(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div style={labelSm}>Admin Fee Financing</div>
                    <input
                      type="number"
                      value={adminFeeEdit}
                      onChange={(e) =>
                        setAdminFeeEdit(e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveFinancials}
                  disabled={savingFinancials}
                  style={{
                    ...primaryBtnStyle,
                    padding: '6px 10px',
                    fontSize: 12,
                    width: 130,
                  }}
                >
                  {savingFinancials ? 'Saving…' : 'Save summary'}
                </button>
              </div>

              {/* CONTACT INFO */}
              <section style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Contact Information
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(180px,1fr))',
                    gap: 6,
                    marginTop: 6,
                    fontSize: 13,
                  }}
                >
                  <InfoField label="Email" value={detail.buyer.email} />
                  <InfoField label="Phone" value={detail.buyer.phone} />
                  <InfoField
                    label="Address"
                    value={
                      detail.buyer.address_line1 ||
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
                        : null
                    }
                  />
                </div>
              </section>

              {/* PUPPIES */}
              <section style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Puppies
                </div>
                {detail.puppies.length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginTop: 4,
                    }}
                  >
                    No puppies assigned yet.
                  </div>
                )}
                {detail.puppies.length > 0 && (
                  <table className="buyerTable">
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
                          <td>{fmtCurrency(p.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 6,
                    borderTop: '1px solid #111827',
                    fontSize: 12,
                    color: '#9ca3af',
                  }}
                >
                  Add puppy (manual)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(140px,1.3fr) minmax(110px,1fr) minmax(120px,1fr) auto',
                    gap: 6,
                    marginTop: 4,
                    alignItems: 'center',
                  }}
                >
                  <input
                    placeholder="Name"
                    value={puppyName}
                    onChange={(e) => setPuppyName(e.target.value)}
                    style={inputStyle}
                  />
                  <select
                    value={puppyStatus}
                    onChange={(e) => setPuppyStatus(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="reserved">Reserved</option>
                    <option value="paid">Paid in full</option>
                    <option value="picked_up">Picked up</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={puppyPrice}
                    onChange={(e) =>
                      setPuppyPrice(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAddPuppy}
                    style={{
                      ...secondaryBtnStyle,
                      padding: '7px 10px',
                    }}
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* PAYMENTS */}
              <section style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Payments
                </div>
                {detail.payments.length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginTop: 4,
                    }}
                  >
                    No payments recorded.
                  </div>
                )}
                {detail.payments.length > 0 && (
                  <table className="buyerTable">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Method / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{fmtDate(p.payment_date)}</td>
                          <td>{p.type || '—'}</td>
                          <td>{fmtCurrency(p.amount)}</td>
                          <td>
                            {p.method || '—'}
                            {p.notes ? ` — ${p.notes}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 6,
                    borderTop: '1px solid #111827',
                    fontSize: 12,
                    color: '#9ca3af',
                  }}
                >
                  Add payment (manual)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(100px,0.9fr) minmax(120px,1fr) minmax(150px,1.2fr) minmax(160px,1.3fr) auto',
                    gap: 6,
                    marginTop: 4,
                    alignItems: 'center',
                  }}
                >
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="deposit">Deposit</option>
                    <option value="payment">Payment</option>
                    <option value="refund">Refund</option>
                    <option value="credit">Credit</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={payAmount}
                    onChange={(e) =>
                      setPayAmount(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    placeholder="Method / notes"
                    value={payMethod}
                    onChange={(e) =>
                      setPayMethod(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    style={{
                      ...secondaryBtnStyle,
                      padding: '7px 10px',
                    }}
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* TRANSPORT */}
              <section>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Transportation
                </div>
                {detail.transports.length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginTop: 4,
                    }}
                  >
                    No trips recorded.
                  </div>
                )}
                {detail.transports.length > 0 && (
                  <table className="buyerTable">
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
                          <td>{fmtCurrency(t.tolls)}</td>
                          <td>{fmtCurrency(t.hotel_cost)}</td>
                          <td>{fmtCurrency(t.fuel_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 6,
                    borderTop: '1px solid #111827',
                    fontSize: 12,
                    color: '#9ca3af',
                  }}
                >
                  Add trip (manual)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(120px,1fr) minmax(150px,1.2fr) minmax(150px,1.2fr)',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    placeholder="From"
                    value={tripFrom}
                    onChange={(e) => setTripFrom(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    placeholder="To"
                    value={tripTo}
                    onChange={(e) => setTripTo(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(120px,1fr))',
                    gap: 6,
                    marginTop: 4,
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="number"
                    placeholder="Miles"
                    value={tripMiles}
                    onChange={(e) =>
                      setTripMiles(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Tolls"
                    value={tripTolls}
                    onChange={(e) =>
                      setTripTolls(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Hotel"
                    value={tripHotel}
                    onChange={(e) =>
                      setTripHotel(e.target.value)
                    }
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Fuel"
                    value={tripFuel}
                    onChange={(e) =>
                      setTripFuel(e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginTop: 4 }}>
                  <input
                    placeholder="Notes (optional)"
                    value={tripNotes}
                    onChange={(e) =>
                      setTripNotes(e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTransport}
                  style={{
                    ...secondaryBtnStyle,
                    marginTop: 6,
                    padding: '7px 10px',
                  }}
                >
                  Add trip
                </button>
              </section>

              <style jsx>{`
                .buyerTable {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 6px;
                  font-size: 13px;
                }
                .buyerTable th,
                .buyerTable td {
                  border-bottom: 1px solid #111827;
                  padding: 6px 6px;
                  text-align: left;
                }
                .buyerTable th {
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.04em;
                  color: #9ca3af;
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 8px',
  borderRadius: 8,
  border: '1px solid #1f2937',
  background: '#020617',
  color: '#f9fafb',
  fontSize: 13,
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: 24,
}

const primaryBtnStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid transparent',
  padding: '8px 10px',
  background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
  color: '#111827',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #374151',
  padding: '8px 10px',
  background: '#020617',
  color: '#e5e7eb',
  fontSize: 13,
  cursor: 'pointer',
}

const labelSm: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 2,
}

function InfoField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <div style={labelSm}>{label}</div>
      <div style={{ fontSize: 13 }}>
        {value && String(value).trim() ? value : '—'}
      </div>
    </div>
  )
}

function SummaryPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div
      style={{
        borderRadius: 999,
        border: '1px solid #1f2937',
        padding: '8px 12px',
        background:
          'radial-gradient(120% 200% at 0 0, rgba(224,169,109,0.15), transparent 55%), #020617',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.05,
          color: '#9ca3af',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: accent || '#e5e7eb',
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* ============================================
   PAYMENTS TAB
   ============================================ */

function PaymentsView() {
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const sb = getBrowserClient()
        const { data, error } = await sb
          .from('puppy_payments')
          .select('id, buyer_id, type, amount, payment_date, method')
          .order('payment_date', { ascending: false })
        if (error) throw error

        const payments = (data ?? []) as PaymentRow[]
        if (cancelled) return

        setRows(payments)

        const byYear: Record<string, PaymentRow[]> = {}
        let grandTotal = 0
        let grandCount = 0
        let latestDate: string | null = null

        for (const p of payments) {
          const dateStr = p.payment_date ?? ''
          const yearMatch = dateStr.slice(0, 4)
          const year =
            yearMatch && /^\d{4}$/.test(yearMatch) ? yearMatch : 'Unknown'
          if (!byYear[year]) byYear[year] = []
          byYear[year].push(p)

          const amt = p.amount ?? 0
          grandTotal += amt
          grandCount += 1
          if (dateStr && (!latestDate || dateStr > latestDate)) {
            latestDate = dateStr
          }
        }

        const years: YearSummary[] = Object.entries(byYear)
          .map(([year, arr]) => {
            let total = 0
            let depositTotal = 0
            let paymentTotal = 0
            let refundTotal = 0
            for (const p of arr) {
              const amt = p.amount ?? 0
              total += amt
              if (p.type === 'deposit') depositTotal += amt
              else if (p.type === 'payment') paymentTotal += amt
              else if (p.type === 'refund') refundTotal += amt
            }
            return {
              year,
              count: arr.length,
              total,
              depositTotal,
              paymentTotal,
              refundTotal,
            }
          })
          .sort((a, b) => (a.year < b.year ? 1 : -1))

        setStats({
          years,
          grandTotal,
          grandCount,
          latestDate,
          byYear,
        })
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load payments.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Payments</h1>
      <p style={{ color: '#9ca3af', marginBottom: 20 }}>
        High-level overview of all payments recorded in the system. Use this to
        reconcile with Zoho Books or your bank statements.
      </p>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {stats && (
        <div
          style={{
            borderRadius: 14,
            border: '1px solid #1f2937',
            background: '#020617',
            padding: 14,
            marginBottom: 16,
            boxShadow: '0 10px 26px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(170px,1fr))',
              gap: 10,
            }}
          >
            <SummaryPill
              label="Grand Total"
              value={fmtCurrency(stats.grandTotal)}
              accent="#22c55e"
            />
            <SummaryPill
              label="Number of Payments"
              value={String(stats.grandCount)}
              accent="#e0a96d"
            />
            <SummaryPill
              label="Most Recent Payment"
              value={stats.latestDate ? fmtDate(stats.latestDate) : '—'}
            />
          </div>
        </div>
      )}

      {loading && (
        <div style={{ color: '#6b7280', fontSize: 14 }}>Loading…</div>
      )}

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(260px,0.9fr) minmax(0,1.4fr)',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          {/* Per-year cards */}
          <div
            style={{
              borderRadius: 14,
              border: '1px solid #1f2937',
              background: '#020617',
              padding: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Payments by year
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {stats.years.map((y) => (
                <div
                  key={y.year}
                  style={{
                    borderRadius: 10,
                    border: '1px solid #111827',
                    padding: 8,
                    background: '#020617',
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#e5e7eb',
                      }}
                    >
                      {y.year}
                    </span>
                    <span style={{ color: '#9ca3af' }}>
                      {y.count} payments
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 2,
                      color: '#9ca3af',
                    }}
                  >
                    <span>Total: {fmtCurrency(y.total)}</span>
                    <span>
                      Deposits: {fmtCurrency(y.depositTotal)}
                    </span>
                    <span>
                      Payments: {fmtCurrency(y.paymentTotal)}
                    </span>
                    <span>
                      Refunds: {fmtCurrency(y.refundTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw table */}
          <div
            style={{
              borderRadius: 14,
              border: '1px solid #1f2937',
              background: '#020617',
              padding: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              All payments
            </div>
            {rows.length === 0 && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                No payments recorded yet.
              </div>
            )}
            {rows.length > 0 && (
              <table className="payTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Buyer ID</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{fmtDate(r.payment_date)}</td>
                      <td>{r.type || '—'}</td>
                      <td>{fmtCurrency(r.amount)}</td>
                      <td>{r.method || '—'}</td>
                      <td
                        style={{
                          fontSize: 11,
                          color: '#6b7280',
                        }}
                      >
                        {r.buyer_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <style jsx>{`
              .payTable {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
              }
              .payTable th,
              .payTable td {
                border-bottom: 1px solid #111827;
                padding: 6px 6px;
                text-align: left;
              }
              .payTable th {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: #9ca3af;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  )
}
