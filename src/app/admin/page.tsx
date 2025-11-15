'use client'

/*
  SWVA Chihuahua – Admin Panel (/admin)

  - Dark themed admin only (user portal stays as-is)
  - Uses existing Supabase browser client from "@/lib/supabase/client"
  - Admin gate via "admin_users" table (user_id column)

  Tabs:
    • Dashboard    – quick counts
    • Buyers       – simple list + contact details
    • Puppies      – manage puppies (basic CRUD + assign buyer)
    • Upcoming Litters – track litters and see puppies under each
    • Applications – approve/deny/waitlist + create buyer + assign puppy
    • Payments     – list all puppy_payments with buyer names
    • Messages     – see threads by buyer + reply as breeder
    • Transport    – transport requests list + edit status/charges/credit
    • Breeding Program – manage breeding dogs, retire, track notes
*/

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'

/* ============================================================
   TABLE NAME CONSTANTS (EDIT HERE IF YOUR NAMES DIFFER)
   ============================================================ */

const TBL_BUYERS = 'puppy_buyers'
const TBL_PUPPIES = 'puppies'
const TBL_APPS = 'puppy_applications'
const TBL_PAYMENTS = 'puppy_payments'
const TBL_MESSAGES = 'puppy_messages'
const TBL_TRANSPORT = 'puppy_transport'
const TBL_LITTERS = 'puppy_litters'
const TBL_BREED_DOGS = 'breeding_dogs'
const TBL_BREED_EXPENSES = 'breeding_expenses'
const TBL_BREED_VACCINES = 'breeding_vaccinations'

type AdminTabKey =
  | 'dashboard'
  | 'buyers'
  | 'puppies'
  | 'litters'
  | 'applications'
  | 'payments'
  | 'messages'
  | 'transport'
  | 'breeding'

const ADMIN_TABS: { key: AdminTabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'buyers', label: 'Buyers' },
  { key: 'puppies', label: 'Puppies' },
  { key: 'litters', label: 'Upcoming Litters' },
  { key: 'applications', label: 'Applications' },
  { key: 'payments', label: 'Payments' },
  { key: 'messages', label: 'Messages' },
  { key: 'transport', label: 'Transportation Requests' },
  { key: 'breeding', label: 'Breeding Program' },
]

/* ============================================================
   SMALL HELPERS
   ============================================================ */

function fmtMoney(v: number | null | undefined): string {
  const n =
    typeof v === 'number' && Number.isFinite(v) ? v : 0
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return d.slice(0, 10)
}

/* ============================================================
   SHARED STYLES
   ============================================================ */

const SHELL_STYLE: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  background:
    'radial-gradient(100% 130% at 0 0, #111827 0%, transparent 60%),' +
    'radial-gradient(100% 130% at 100% 0, #020617 0%, transparent 60%),' +
    '#020617',
  color: '#f9fafb',
  fontFamily:
    'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
}

const SIDEBAR_STYLE: React.CSSProperties = {
  width: 260,
  padding: '18px 16px 18px',
  boxSizing: 'border-box',
  borderRight: '1px solid #1f2937',
  background: 'linear-gradient(180deg,#020617,#020617,#0b1120)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
}

const MAIN_STYLE: React.CSSProperties = {
  flex: 1,
  padding: '20px 22px 24px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const TAB_BASE_STYLE: React.CSSProperties = {
  width: '100%',
  borderRadius: 999,
  padding: '8px 12px',
  border: '1px solid #1f2937',
  background: 'transparent',
  color: '#e5e7eb',
  textAlign: 'left',
  fontSize: 13,
  cursor: 'pointer',
  marginBottom: 6,
}

const TAB_ACTIVE_STYLE: React.CSSProperties = {
  ...TAB_BASE_STYLE,
  background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
  color: '#111827',
  borderColor: 'transparent',
  fontWeight: 600,
}

const PANEL_STYLE: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #1f2937',
  background: '#020617',
  padding: 14,
  boxShadow: '0 14px 32px rgba(0,0,0,0.7)',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid #1f2937',
  padding: '6px 8px',
  fontSize: 13,
  background: '#020617',
  color: '#f9fafb',
  boxSizing: 'border-box',
}

const SELECT_STYLE = INPUT_STYLE

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  borderRadius: 999,
  border: 'none',
  padding: '8px 12px',
  fontSize: 13,
  background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
  color: '#111827',
  cursor: 'pointer',
}

/* ============================================================
   ROOT ADMIN PAGE (admin gate + layout + tabs)
   ============================================================ */

export default function AdminPage() {
  const router = useRouter()
  const supabase = getBrowserClient()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard')

    useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        // 1) Make sure the user is logged in
        const { data, error } = await supabase.auth.getUser()
        const user = data?.user

        if (error || !user) {
          // Not logged in – send to login
          router.replace('/login')
          return
        }

        // 2) TEMP: allow ANY logged-in user to access /admin
        //    (We’ll tighten this later if you want.)
        if (!cancelled) {
          setAllowed(true)
          setChecking(false)
        }
      } catch (e) {
        if (!cancelled) {
          router.replace('/login')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, supabase])


  if (checking) {
    return (
      <div
        style={{
          ...SHELL_STYLE,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 14, color: '#e5e7eb' }}>
          Checking admin access…
        </div>
      </div>
    )
  }

  if (!allowed) {
    return null
  }

  return (
    <div style={SHELL_STYLE}>
      {/* SIDEBAR */}
      <aside style={SIDEBAR_STYLE}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🐾
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              SWVA Chihuahua
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              Admin Portal
            </div>
          </div>
        </div>

        <nav style={{ marginTop: 14 }}>
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={
                activeTab === tab.key
                  ? TAB_ACTIVE_STYLE
                  : TAB_BASE_STYLE
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main style={MAIN_STYLE}>
        {activeTab === 'dashboard' && <DashboardTab />}

        {activeTab === 'buyers' && <BuyersTab />}

        {activeTab === 'puppies' && <PuppiesTab />}

        {activeTab === 'litters' && <LittersTab />}

        {activeTab === 'applications' && <ApplicationsTab />}

        {activeTab === 'payments' && <PaymentsTab />}

        {activeTab === 'messages' && <MessagesTab />}

        {activeTab === 'transport' && <TransportTab />}

        {activeTab === 'breeding' && <BreedingTab />}
      </main>
    </div>
  )
}

/* ============================================================
   DASHBOARD TAB
   ============================================================ */

function DashboardTab() {
  const supabase = getBrowserClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    buyers: number
    puppies: number
    apps: number
    payments: number
    messages: number
    transport: number
  }>({
    buyers: 0,
    puppies: 0,
    apps: 0,
    payments: 0,
    messages: 0,
    transport: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function safeCount(table: string): Promise<number> {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
        if (error || count == null) return 0
        return count
      } catch {
        return 0
      }
    }

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [buyers, puppies, apps, payments, messages, transport] =
          await Promise.all([
            safeCount(TBL_BUYERS),
            safeCount(TBL_PUPPIES),
            safeCount(TBL_APPS),
            safeCount(TBL_PAYMENTS),
            safeCount(TBL_MESSAGES),
            safeCount(TBL_TRANSPORT),
          ])
        if (!cancelled) {
          setStats({ buyers, puppies, apps, payments, messages, transport })
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load stats.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [supabase])

  const CARDS: {
    label: string
    value: number
    helper?: string
  }[] = [
    { label: 'Buyers', value: stats.buyers, helper: 'Approved families' },
    { label: 'Puppies', value: stats.puppies, helper: 'In the system' },
    { label: 'Applications', value: stats.apps, helper: 'Pending or reviewed' },
    { label: 'Payments', value: stats.payments, helper: 'Recorded payments' },
    { label: 'Messages', value: stats.messages, helper: 'Conversations' },
    {
      label: 'Transport Requests',
      value: stats.transport,
      helper: 'Trips to plan',
    },
  ]

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Admin Dashboard</h1>
      <p style={{ color: '#9ca3af', marginBottom: 16 }}>
        Quick overview of your program. Use the sidebar to move into each
        workflow for detailed management.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 14,
        }}
      >
        {CARDS.map((c) => (
          <div key={c.label} style={PANEL_STYLE}>
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.08,
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
                marginBottom: 4,
              }}
            >
              {loading ? '—' : c.value}
            </div>
            {c.helper && (
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {c.helper}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

/* ============================================================
   BUYERS TAB – simple list + contact info
   ============================================================ */

type BuyerRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

function BuyersTab() {
  const supabase = getBrowserClient()
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingList(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from(TBL_BUYERS)
          .select('id, full_name, email, phone, city, state, created_at')
          .order('created_at', { ascending: false })
        if (error) throw error
        if (!cancelled) {
          const rows = (data || []) as BuyerRow[]
          setBuyers(rows)
          if (rows.length && !selectedId) {
            setSelectedId(rows[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load buyers.')
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

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
        const [buyerRes, puppiesRes, paymentsRes] = await Promise.all([
          supabase
            .from(TBL_BUYERS)
            .select('*')
            .eq('id', selectedId)
            .maybeSingle(),
          supabase
            .from(TBL_PUPPIES)
            .select('id,name,status,price')
            .eq('buyer_id', selectedId)
            .order('name', { ascending: true }),
          supabase
            .from(TBL_PAYMENTS)
            .select(
              'id,type,amount,payment_date,method,notes,puppy_id'
            )
            .eq('buyer_id', selectedId)
            .order('payment_date', { ascending: false }),
        ])

        if (buyerRes.error) throw buyerRes.error
        if (!buyerRes.data) throw new Error('Buyer not found')

        if (!cancelled) {
          setDetail({
            buyer: buyerRes.data,
            puppies: puppiesRes.data || [],
            payments: paymentsRes.data || [],
          })
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
  }, [selectedId, supabase])

  async function handleAddBuyer() {
    if (!newName.trim()) return
    try {
      const { data, error } = await supabase
        .from(TBL_BUYERS)
        .insert({
          full_name: newName.trim(),
          email: newEmail.trim() || null,
          phone: newPhone.trim() || null,
        })
        .select(
          'id, full_name, email, phone, city, state, created_at'
        )
        .single()
      if (error) throw error
      const row = data as BuyerRow
      setBuyers((prev) => [row, ...prev])
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      setSelectedId(row.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to add buyer.')
    }
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Buyers</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        This section lets you see each family, their assigned puppies,
        and payment history.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT – list + add */}
        <div style={{ ...PANEL_STYLE, height: 'min(72vh,620px)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Add Buyer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              style={INPUT_STYLE}
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              style={INPUT_STYLE}
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              style={INPUT_STYLE}
              placeholder="Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <button
              type="button"
              style={PRIMARY_BUTTON_STYLE}
              onClick={handleAddBuyer}
            >
              Save Buyer
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #111827',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            All Buyers
          </div>

          <div
            style={{
              marginTop: 6,
              maxHeight: 310,
              overflowY: 'auto',
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
                No buyers yet.
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
                  marginBottom: 6,
                  borderRadius: 10,
                  border:
                    selectedId === b.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  padding: '7px 8px',
                  background:
                    selectedId === b.id ? '#111827' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600 }}>{b.full_name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  {b.email || '—'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT – detail */}
        <div style={PANEL_STYLE}>
          {loadingDetail && !detail && (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>
              Loading buyer details…
            </div>
          )}
          {!loadingDetail && !detail && (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>
              Select a buyer on the left.
            </div>
          )}
          {detail && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: 4 }}>
                {detail.buyer.full_name}
              </h2>
              <div
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginBottom: 10,
                }}
              >
                {detail.buyer.email || 'No email'} ·{' '}
                {detail.buyer.phone || 'No phone'}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    border: '1px solid #1f2937',
                    padding: 10,
                    fontSize: 13,
                  }}
                >
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>
                    Puppies
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {detail.puppies.length}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 12,
                    border: '1px solid #1f2937',
                    padding: 10,
                    fontSize: 13,
                  }}
                >
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>
                    Payments
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {fmtMoney(
                      detail.payments.reduce(
                        (s: number, p: any) => s + (p.amount || 0),
                        0
                      )
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                  gap: 12,
                }}
              >
                {/* Puppies list */}
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    Puppies
                  </h3>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      marginBottom: 4,
                    }}
                  >
                    Any puppy with this buyer_id.
                  </div>
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      paddingRight: 4,
                    }}
                  >
                    {detail.puppies.length === 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#6b7280',
                        }}
                      >
                        None yet.
                      </div>
                    )}
                    {detail.puppies.map((p: any) => (
                      <div
                        key={p.id}
                        style={{
                          borderRadius: 10,
                          border: '1px solid #1f2937',
                          padding: '6px 8px',
                          marginBottom: 5,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {p.name || 'Unnamed puppy'}
                        </div>
                        <div style={{ color: '#9ca3af' }}>
                          Status: {p.status || '—'} · Price:{' '}
                          {fmtMoney(p.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payments list */}
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    Payments
                  </h3>
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      paddingRight: 4,
                      fontSize: 12,
                    }}
                  >
                    {detail.payments.length === 0 && (
                      <div style={{ color: '#6b7280' }}>
                        No payments recorded yet.
                      </div>
                    )}
                    {detail.payments.map((p: any) => (
                      <div
                        key={p.id}
                        style={{
                          borderRadius: 10,
                          border: '1px solid #1f2937',
                          padding: '6px 8px',
                          marginBottom: 5,
                        }}
                      >
                        <div>
                          {fmtMoney(p.amount)} · {p.type || 'payment'}
                        </div>
                        <div style={{ color: '#9ca3af' }}>
                          {fmtDate(p.payment_date)} · {p.method || '—'}
                        </div>
                        {p.notes && (
                          <div
                            style={{
                              marginTop: 2,
                              color: '#9ca3af',
                            }}
                          >
                            {p.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ============================================================
   PUPPIES TAB – manage puppies (list + add + basic edit)
   ============================================================ */

type PuppyRow = {
  id: string
  name: string | null
  status: string | null
  price: number | null
  buyer_id: string | null
  litter_id: string | null
  gender: string | null
  color: string | null
  coat_type: string | null
  registry: string | null
  dob: string | null
  ready_date: string | null
}

function PuppiesTab() {
  const supabase = getBrowserClient()
  const [puppies, setPuppies] = useState<PuppyRow[]>([])
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // new puppy
  const [newPuppy, setNewPuppy] = useState<{
    name: string
    price: string
    status: string
    buyer_id: string
    gender: string
    color: string
    coat_type: string
    registry: string
    dob: string
    ready_date: string
  }>({
    name: '',
    price: '',
    status: 'available',
    buyer_id: '',
    gender: '',
    color: '',
    coat_type: '',
    registry: '',
    dob: '',
    ready_date: '',
  })

  // edit
  const selected = useMemo(
    () => puppies.find((p) => p.id === selectedId) || null,
    [puppies, selectedId]
  )
  const [editFields, setEditFields] = useState<{
    name: string
    price: string
    status: string
    buyer_id: string
  }>({
    name: '',
    price: '',
    status: '',
    buyer_id: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [pRes, bRes] = await Promise.all([
          supabase
            .from(TBL_PUPPIES)
            .select(
              'id,name,status,price,buyer_id,litter_id,gender,color,coat_type,registry,dob,ready_date'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from(TBL_BUYERS)
            .select('id,full_name,email,phone,city,state,created_at')
            .order('full_name', { ascending: true }),
        ])
        if (pRes.error) throw pRes.error
        if (bRes.error) throw bRes.error

        if (!cancelled) {
          setPuppies((pRes.data || []) as PuppyRow[])
          setBuyers((bRes.data || []) as BuyerRow[])
          if (!selectedId && (pRes.data || []).length) {
            setSelectedId((pRes.data as any)[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load puppies.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

  useEffect(() => {
    if (!selected) return
    setEditFields({
      name: selected.name || '',
      price:
        selected.price != null ? String(selected.price) : '',
      status: selected.status || '',
      buyer_id: selected.buyer_id || '',
    })
  }, [selected])

  async function handleAddPuppy() {
    if (!newPuppy.name.trim()) return
    try {
      const price = newPuppy.price
        ? Number(newPuppy.price)
        : null
      const { data, error } = await supabase
        .from(TBL_PUPPIES)
        .insert({
          name: newPuppy.name.trim(),
          price,
          status: newPuppy.status || null,
          buyer_id: newPuppy.buyer_id || null,
          gender: newPuppy.gender || null,
          color: newPuppy.color || null,
          coat_type: newPuppy.coat_type || null,
          registry: newPuppy.registry || null,
          dob: newPuppy.dob || null,
          ready_date: newPuppy.ready_date || null,
        })
        .select(
          'id,name,status,price,buyer_id,litter_id,gender,color,coat_type,registry,dob,ready_date'
        )
        .single()
      if (error) throw error
      const row = data as PuppyRow
      setPuppies((prev) => [row, ...prev])
      setNewPuppy({
        name: '',
        price: '',
        status: 'available',
        buyer_id: '',
        gender: '',
        color: '',
        coat_type: '',
        registry: '',
        dob: '',
        ready_date: '',
      })
      setSelectedId(row.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to add puppy.')
    }
  }

  async function handleSaveEdit() {
    if (!selected) return
    try {
      const price = editFields.price
        ? Number(editFields.price)
        : null
      const { error } = await supabase
        .from(TBL_PUPPIES)
        .update({
          name: editFields.name.trim() || null,
          price,
          status: editFields.status || null,
          buyer_id: editFields.buyer_id || null,
        })
        .eq('id', selected.id)
      if (error) throw error

      setPuppies((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? {
                ...p,
                name: editFields.name || null,
                price,
                status: editFields.status || null,
                buyer_id: editFields.buyer_id || null,
              }
            : p
        )
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to save puppy changes.')
    }
  }

  async function handleDelete() {
    if (!selected) return
    if (!window.confirm('Delete this puppy?')) return
    try {
      const { error } = await supabase
        .from(TBL_PUPPIES)
        .delete()
        .eq('id', selected.id)
      if (error) throw error
      setPuppies((prev) =>
        prev.filter((p) => p.id !== selected.id)
      )
      setSelectedId(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to delete puppy.')
    }
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Puppies</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Create, update, assign, or remove puppies. Assigning a buyer_id
        ties the puppy to that family in the Buyers tab.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '310px 1fr',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT – list + add */}
        <div style={{ ...PANEL_STYLE, height: 'min(76vh,640px)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Add Puppy
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <input
              style={INPUT_STYLE}
              placeholder="Puppy name"
              value={newPuppy.name}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Price (e.g. 2200)"
              value={newPuppy.price}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  price: e.target.value,
                }))
              }
            />
            <select
              style={SELECT_STYLE}
              value={newPuppy.status}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  status: e.target.value,
                }))
              }
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="">(none)</option>
            </select>
            <select
              style={SELECT_STYLE}
              value={newPuppy.buyer_id}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  buyer_id: e.target.value,
                }))
              }
            >
              <option value="">Assign to buyer (optional)</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name}
                </option>
              ))}
            </select>
            <input
              style={INPUT_STYLE}
              placeholder="Gender (M/F)"
              value={newPuppy.gender}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  gender: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Color"
              value={newPuppy.color}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  color: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Coat type"
              value={newPuppy.coat_type}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  coat_type: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Registry (AKC/CKC/ACA)"
              value={newPuppy.registry}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  registry: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              type="date"
              placeholder="DOB"
              value={newPuppy.dob}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  dob: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              type="date"
              placeholder="Ready date"
              value={newPuppy.ready_date}
              onChange={(e) =>
                setNewPuppy((v) => ({
                  ...v,
                  ready_date: e.target.value,
                }))
              }
            />
            <button
              type="button"
              style={PRIMARY_BUTTON_STYLE}
              onClick={handleAddPuppy}
            >
              Save Puppy
            </button>
          </div>

          <div
            style={{
              borderTop: '1px solid #111827',
              paddingTop: 8,
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            All Puppies
          </div>

          <div
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              paddingRight: 4,
              fontSize: 12,
            }}
          >
            {loading && (
              <div style={{ color: '#6b7280' }}>Loading puppies…</div>
            )}
            {!loading && puppies.length === 0 && (
              <div style={{ color: '#6b7280' }}>No puppies yet.</div>
            )}
            {puppies.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 10,
                  border:
                    selectedId === p.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  padding: '6px 8px',
                  marginBottom: 5,
                  background:
                    selectedId === p.id ? '#111827' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {p.name || 'Unnamed puppy'}
                </div>
                <div style={{ color: '#9ca3af' }}>
                  {p.status || '—'} · {fmtMoney(p.price)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT – edit selected */}
        <div style={PANEL_STYLE}>
          {!selected && (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Select a puppy on the left to edit, assign, or delete.
            </div>
          )}
          {selected && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: 6 }}>
                Edit Puppy
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Name
                  </div>
                  <input
                    style={INPUT_STYLE}
                    value={editFields.name}
                    onChange={(e) =>
                      setEditFields((v) => ({
                        ...v,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Price
                  </div>
                  <input
                    style={INPUT_STYLE}
                    value={editFields.price}
                    onChange={(e) =>
                      setEditFields((v) => ({
                        ...v,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Status
                  </div>
                  <select
                    style={SELECT_STYLE}
                    value={editFields.status}
                    onChange={(e) =>
                      setEditFields((v) => ({
                        ...v,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="">(none)</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Assign to Buyer
                  </div>
                  <select
                    style={SELECT_STYLE}
                    value={editFields.buyer_id}
                    onChange={(e) =>
                      setEditFields((v) => ({
                        ...v,
                        buyer_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">(none)</option>
                    {buyers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    background: '#7f1d1d',
                    color: '#fecaca',
                  }}
                >
                  Delete Puppy
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ============================================================
   LITTERS TAB – upcoming litters
   ============================================================ */

type LitterRow = {
  id: string
  name: string | null
  dam_name: string | null
  sire_name: string | null
  expected_date: string | null
  status: string | null
  notes: string | null
}

function LittersTab() {
  const supabase = getBrowserClient()
  const [litters, setLitters] = useState<LitterRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [puppies, setPuppies] = useState<PuppyRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const [newLitter, setNewLitter] = useState<{
    name: string
    dam_name: string
    sire_name: string
    expected_date: string
    status: string
    notes: string
  }>({
    name: '',
    dam_name: '',
    sire_name: '',
    expected_date: '',
    status: 'planned',
    notes: '',
  })

  const selected = useMemo(
    () => litters.find((l) => l.id === selectedId) || null,
    [litters, selectedId]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const { data, error } = await supabase
          .from(TBL_LITTERS)
          .select('*')
          .order('expected_date', { ascending: true })
        if (error) throw error
        if (!cancelled) {
          setLitters((data || []) as LitterRow[])
          if (!selectedId && (data || []).length) {
            setSelectedId((data as any)[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load litters.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

  useEffect(() => {
    if (!selectedId) {
      setPuppies([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from(TBL_PUPPIES)
          .select('id,name,status,price,litter_id')
          .eq('litter_id', selectedId)
          .order('name', { ascending: true })
        if (error) throw error
        if (!cancelled)
          setPuppies((data || []) as PuppyRow[])
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load litter puppies.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

  async function handleAddLitter() {
    if (!newLitter.dam_name.trim() && !newLitter.name.trim()) return
    try {
      const { data, error } = await supabase
        .from(TBL_LITTERS)
        .insert({
          name: newLitter.name.trim() || null,
          dam_name: newLitter.dam_name.trim() || null,
          sire_name: newLitter.sire_name.trim() || null,
          expected_date: newLitter.expected_date || null,
          status: newLitter.status || null,
          notes: newLitter.notes.trim() || null,
        })
        .select('*')
        .single()
      if (error) throw error
      const row = data as LitterRow
      setLitters((prev) => [...prev, row])
      setNewLitter({
        name: '',
        dam_name: '',
        sire_name: '',
        expected_date: '',
        status: 'planned',
        notes: '',
      })
      setSelectedId(row.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to add litter.')
    }
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Upcoming Litters</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Track each planned/current litter, then see any puppies tied to
        that litter_id.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 14,
        }}
      >
        {/* List + add */}
        <div style={PANEL_STYLE}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Add Litter
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <input
              style={INPUT_STYLE}
              placeholder="Litter name (optional)"
              value={newLitter.name}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Dam name"
              value={newLitter.dam_name}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  dam_name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Sire name"
              value={newLitter.sire_name}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  sire_name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              type="date"
              value={newLitter.expected_date}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  expected_date: e.target.value,
                }))
              }
            />
            <select
              style={SELECT_STYLE}
              value={newLitter.status}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  status: e.target.value,
                }))
              }
            >
              <option value="planned">Planned</option>
              <option value="whelped">Whelped</option>
              <option value="completed">Completed</option>
            </select>
            <textarea
              style={{
                ...INPUT_STYLE,
                minHeight: 60,
                resize: 'vertical',
              }}
              placeholder="Notes"
              value={newLitter.notes}
              onChange={(e) =>
                setNewLitter((v) => ({
                  ...v,
                  notes: e.target.value,
                }))
              }
            />
            <button
              type="button"
              style={PRIMARY_BUTTON_STYLE}
              onClick={handleAddLitter}
            >
              Save Litter
            </button>
          </div>

          <div
            style={{
              borderTop: '1px solid #111827',
              paddingTop: 8,
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            All Litters
          </div>
          <div
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              paddingRight: 4,
              fontSize: 12,
            }}
          >
            {litters.length === 0 && (
              <div style={{ color: '#6b7280' }}>
                No litters recorded yet.
              </div>
            )}
            {litters.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedId(l.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 10,
                  border:
                    selectedId === l.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  padding: '6px 8px',
                  marginBottom: 5,
                  background:
                    selectedId === l.id ? '#111827' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {l.name || `${l.dam_name || 'Dam'} × ${l.sire_name || 'Sire'}`}
                </div>
                <div style={{ color: '#9ca3af' }}>
                  {fmtDate(l.expected_date)} · {l.status || '—'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={PANEL_STYLE}>
          {!selected && (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Select a litter on the left to view puppies.
            </div>
          )}
          {selected && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: 4 }}>
                {selected.name ||
                  `${selected.dam_name || 'Dam'} × ${
                    selected.sire_name || 'Sire'
                  }`}
              </h2>
              <div
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                Expected: {fmtDate(selected.expected_date)} · Status:{' '}
                {selected.status || '—'}
              </div>
              {selected.notes && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginBottom: 10,
                  }}
                >
                  {selected.notes}
                </div>
              )}

              <h3
                style={{
                  margin: 0,
                  marginBottom: 6,
                  fontSize: 14,
                }}
              >
                Puppies in this Litter
              </h3>
              <div
                style={{
                  maxHeight: 260,
                  overflowY: 'auto',
                  paddingRight: 4,
                  fontSize: 12,
                }}
              >
                {puppies.length === 0 && (
                  <div style={{ color: '#6b7280' }}>
                    No puppies linked to this litter yet (set
                    litter_id on the Puppies tab).
                  </div>
                )}
                {puppies.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      borderRadius: 10,
                      border: '1px solid #1f2937',
                      padding: '6px 8px',
                      marginBottom: 5,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {p.name || 'Unnamed puppy'}
                    </div>
                    <div style={{ color: '#9ca3af' }}>
                      {p.status || '—'} · {fmtMoney(p.price)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ============================================================
   APPLICATIONS TAB – approve/deny/waitlist + create buyer + assign puppy
   ============================================================ */

type ApplicationRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: string | null
  created_at: string
  notes: string | null
  buyer_id: string | null
}

function ApplicationsTab() {
  const supabase = getBrowserClient()
  const [apps, setApps] = useState<ApplicationRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [puppies, setPuppies] = useState<PuppyRow[]>([])
  const [assignPuppyId, setAssignPuppyId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) || null,
    [apps, selectedId]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [appRes, buyerRes, pupRes] = await Promise.all([
          supabase
            .from(TBL_APPS)
            .select(
              'id,full_name,email,phone,status,created_at,notes,buyer_id'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from(TBL_BUYERS)
            .select('id,full_name,email,phone,city,state,created_at'),
          supabase
            .from(TBL_PUPPIES)
            .select(
              'id,name,status,price,buyer_id,litter_id,gender,color,coat_type,registry,dob,ready_date'
            )
            .order('created_at', { ascending: false }),
        ])
        if (appRes.error) throw appRes.error
        if (buyerRes.error) throw buyerRes.error
        if (pupRes.error) throw pupRes.error

        if (!cancelled) {
          setApps((appRes.data || []) as ApplicationRow[])
          setBuyers((buyerRes.data || []) as BuyerRow[])
          setPuppies((pupRes.data || []) as PuppyRow[])
          if (!selectedId && (appRes.data || []).length) {
            setSelectedId((appRes.data as any)[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load applications.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

  async function updateStatus(status: string) {
    if (!selected) return
    try {
      const { error } = await supabase
        .from(TBL_APPS)
        .update({ status })
        .eq('id', selected.id)
      if (error) throw error
      setApps((prev) =>
        prev.map((a) =>
          a.id === selected.id ? { ...a, status } : a
        )
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to update status.')
    }
  }

  async function handleCreateBuyerFromApp() {
    if (!selected) return
    if (selected.buyer_id) {
      setError('This application already has a buyer record.')
      return
    }
    try {
      const { data, error } = await supabase
        .from(TBL_BUYERS)
        .insert({
          full_name: selected.full_name,
          email: selected.email,
          phone: selected.phone,
        })
        .select('id,full_name,email,phone,city,state,created_at')
        .single()
      if (error) throw error

      const buyer = data as BuyerRow
      setBuyers((prev) => [buyer, ...prev])

      const { error: updError } = await supabase
        .from(TBL_APPS)
        .update({ buyer_id: buyer.id, status: 'approved' })
        .eq('id', selected.id)
      if (updError) throw updError

      setApps((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? { ...a, buyer_id: buyer.id, status: 'approved' }
            : a
        )
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to create buyer from application.')
    }
  }

  async function handleAssignPuppy() {
    if (!selected || !assignPuppyId) return
    if (!selected.buyer_id) {
      setError('Create a buyer for this application first.')
      return
    }
    try {
      const { error } = await supabase
        .from(TBL_PUPPIES)
        .update({
          buyer_id: selected.buyer_id,
          status: 'reserved',
        })
        .eq('id', assignPuppyId)
      if (error) throw error

      setPuppies((prev) =>
        prev.map((p) =>
          p.id === assignPuppyId
            ? {
                ...p,
                buyer_id: selected.buyer_id,
                status: 'reserved',
              }
            : p
        )
      )
      setAssignPuppyId('')
    } catch (e: any) {
      setError(e?.message || 'Failed to assign puppy.')
    }
  }

  const buyerMap = useMemo(() => {
    const m: Record<string, string> = {}
    buyers.forEach((b) => {
      m[b.id] = b.full_name
    })
    return m
  }, [buyers])

  const availablePuppies = useMemo(
    () =>
      puppies.filter(
        (p) => !p.buyer_id && (p.status === 'available' || !p.status)
      ),
    [puppies]
  )

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Applications</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Review applications, set status (approve/deny/waitlist), then
        create buyers and assign puppies when they’re ready.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 14,
        }}
      >
        {/* List */}
        <div style={{ ...PANEL_STYLE, height: 'min(76vh,640px)' }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 6,
              fontSize: 13,
            }}
          >
            All Applications
          </div>
          <div
            style={{
              marginBottom: 6,
              fontSize: 12,
              color: '#9ca3af',
            }}
          >
            Click to open. Status color: pending (plain), approved
            (✓), denied (×), waitlist (…).
          </div>
          <div
            style={{
              maxHeight: 520,
              overflowY: 'auto',
              paddingRight: 4,
              fontSize: 12,
            }}
          >
            {loading && (
              <div style={{ color: '#6b7280' }}>
                Loading applications…
              </div>
            )}
            {!loading && apps.length === 0 && (
              <div style={{ color: '#6b7280' }}>
                No applications yet.
              </div>
            )}
            {apps.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 10,
                  border:
                    selectedId === a.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  padding: '7px 8px',
                  marginBottom: 5,
                  background:
                    selectedId === a.id ? '#111827' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{a.full_name}</div>
                <div style={{ color: '#9ca3af' }}>
                  {fmtDate(a.created_at)} ·{' '}
                  {a.status || 'pending'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={PANEL_STYLE}>
          {!selected && (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Select an application on the left.
            </div>
          )}
          {selected && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: 4 }}>
                {selected.full_name}
              </h2>
              <div
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                {selected.email || 'No email'} ·{' '}
                {selected.phone || 'No phone'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginBottom: 10,
                }}
              >
                Status: {selected.status || 'pending'} · Buyer record:{' '}
                {selected.buyer_id
                  ? buyerMap[selected.buyer_id] || selected.buyer_id
                  : 'none yet'}
              </div>

              {selected.notes && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginBottom: 10,
                  }}
                >
                  Notes: {selected.notes}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={() => updateStatus('approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    background: '#b91c1c',
                    color: '#fee2e2',
                  }}
                  onClick={() => updateStatus('denied')}
                >
                  Deny
                </button>
                <button
                  type="button"
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    background: '#4b5563',
                    color: '#e5e7eb',
                  }}
                  onClick={() => updateStatus('waitlist')}
                >
                  Waitlist
                </button>
                <button
                  type="button"
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    background: '#22c55e',
                    color: '#022c22',
                  }}
                  onClick={handleCreateBuyerFromApp}
                >
                  Create Buyer from Application
                </button>
              </div>

              <div
                style={{
                  borderTop: '1px solid #111827',
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    marginBottom: 6,
                    fontSize: 14,
                  }}
                >
                  Assign Puppy
                </h3>
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginBottom: 6,
                  }}
                >
                  Choose an available puppy and click Assign. The
                  puppy will be marked as reserved for this buyer.
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <select
                    style={{
                      ...SELECT_STYLE,
                      maxWidth: 260,
                    }}
                    value={assignPuppyId}
                    onChange={(e) =>
                      setAssignPuppyId(e.target.value)
                    }
                  >
                    <option value="">
                      Select available puppy…
                    </option>
                    {availablePuppies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || 'Unnamed'} ·{' '}
                        {fmtMoney(p.price)} ·{' '}
                        {p.registry || ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    style={PRIMARY_BUTTON_STYLE}
                    onClick={handleAssignPuppy}
                  >
                    Assign Puppy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ============================================================
   PAYMENTS TAB – list all puppy_payments
   ============================================================ */

type PaymentRow = {
  id: string
  buyer_id: string | null
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
}

function PaymentsTab() {
  const supabase = getBrowserClient()
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [pRes, bRes] = await Promise.all([
          supabase
            .from(TBL_PAYMENTS)
            .select(
              'id,buyer_id,type,amount,payment_date,method'
            )
            .order('payment_date', { ascending: false }),
          supabase
            .from(TBL_BUYERS)
            .select('id,full_name,email,phone,city,state,created_at'),
        ])
        if (pRes.error) throw pRes.error
        if (bRes.error) throw bRes.error
        if (!cancelled) {
          setRows((pRes.data || []) as PaymentRow[])
          setBuyers((bRes.data || []) as BuyerRow[])
        }
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
  }, [supabase])

  const buyerMap = useMemo(() => {
    const m: Record<string, string> = {}
    buyers.forEach((b) => {
      m[b.id] = b.full_name
    })
    return m
  }, [buyers])

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Payments</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        All recorded puppy payments. Amounts reflect what is stored in
        {` ${TBL_PAYMENTS} `}.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div style={PANEL_STYLE}>
        {loading && (
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Loading payments…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            No payments found.
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              fontSize: 12,
            }}
          >
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  borderBottom: '1px solid #111827',
                  padding: '6px 0',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {buyerMap[r.buyer_id || ''] || 'Unknown buyer'}
                  </div>
                  <div style={{ color: '#9ca3af' }}>
                    {fmtDate(r.payment_date)} · {r.type || 'payment'} ·{' '}
                    {r.method || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  {fmtMoney(r.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ============================================================
   MESSAGES TAB – buyer threads + reply as breeder
   ============================================================ */

type MessageRow = {
  id: string
  buyer_id: string | null
  sender_role: string | null
  body: string | null
  created_at: string
}

function MessagesTab() {
  const supabase = getBrowserClient()
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [mRes, bRes] = await Promise.all([
          supabase
            .from(TBL_MESSAGES)
            .select('id,buyer_id,sender_role,body,created_at')
            .order('created_at', { ascending: true })
            .limit(500),
          supabase
            .from(TBL_BUYERS)
            .select('id,full_name,email,phone,city,state,created_at'),
        ])
        if (mRes.error) throw mRes.error
        if (bRes.error) throw bRes.error
        if (!cancelled) {
          setMessages((mRes.data || []) as MessageRow[])
          const bRows = (bRes.data || []) as BuyerRow[]
          setBuyers(bRows)
          if (!selectedBuyerId && bRows.length) {
            setSelectedBuyerId(bRows[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load messages.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedBuyerId])

  const buyerMap = useMemo(() => {
    const m: Record<string, BuyerRow> = {}
    buyers.forEach((b) => {
      m[b.id] = b
    })
    return m
  }, [buyers])

  const groupedByBuyer = useMemo(() => {
    const m: Record<string, MessageRow[]> = {}
    messages.forEach((msg) => {
      const key = msg.buyer_id || 'no_buyer'
      if (!m[key]) m[key] = []
      m[key].push(msg)
    })
    return m
  }, [messages])

  const thread = useMemo(
    () =>
      selectedBuyerId
        ? groupedByBuyer[selectedBuyerId] || []
        : [],
    [groupedByBuyer, selectedBuyerId]
  )

  async function handleSendMessage() {
    if (!selectedBuyerId || !newMessage.trim()) return
    try {
      const { data, error } = await supabase
        .from(TBL_MESSAGES)
        .insert({
          buyer_id: selectedBuyerId,
          sender_role: 'breeder',
          body: newMessage.trim(),
        })
        .select(
          'id,buyer_id,sender_role,body,created_at'
        )
        .single()
      if (error) throw error
      const row = data as MessageRow
      setMessages((prev) => [...prev, row])
      setNewMessage('')
    } catch (e: any) {
      setError(e?.message || 'Failed to send message.')
    }
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Messages</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Two-way conversations with your buyers. Buyer threads are
        grouped together; you reply as the breeder.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 14,
        }}
      >
        {/* Buyer list */}
        <div style={PANEL_STYLE}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Buyer Threads
          </div>
          <div
            style={{
              maxHeight: 500,
              overflowY: 'auto',
              fontSize: 12,
              paddingRight: 4,
            }}
          >
            {loading && (
              <div style={{ color: '#6b7280' }}>Loading…</div>
            )}
            {!loading && buyers.length === 0 && (
              <div style={{ color: '#6b7280' }}>No buyers yet.</div>
            )}
            {buyers.map((b) => {
              const msgs = groupedByBuyer[b.id] || []
              const last = msgs[msgs.length - 1]
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBuyerId(b.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 10,
                    border:
                      selectedBuyerId === b.id
                        ? '1px solid #e0a96d'
                        : '1px solid #111827',
                    padding: '6px 8px',
                    marginBottom: 5,
                    background:
                      selectedBuyerId === b.id
                        ? '#111827'
                        : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {b.full_name}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>
                    {msgs.length} message
                    {msgs.length === 1 ? '' : 's'}
                    {last && last.body && (
                      <>
                        {' '}
                        · Last: {last.body.slice(0, 24)}
                        {last.body.length > 24 ? '…' : ''}
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Thread */}
        <div style={PANEL_STYLE}>
          {!selectedBuyerId && (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Select a buyer thread on the left.
            </div>
          )}
          {selectedBuyerId && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {buyerMap[selectedBuyerId]?.full_name ||
                  'Unknown buyer'}
              </div>

              <div
                style={{
                  maxHeight: 420,
                  overflowY: 'auto',
                  paddingRight: 4,
                  marginBottom: 8,
                  fontSize: 12,
                }}
              >
                {thread.length === 0 && (
                  <div style={{ color: '#6b7280' }}>
                    No messages yet for this buyer.
                  </div>
                )}
                {thread.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      marginBottom: 8,
                      textAlign:
                        m.sender_role === 'breeder'
                          ? 'right'
                          : 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        borderRadius: 12,
                        padding: '6px 8px',
                        background:
                          m.sender_role === 'breeder'
                            ? '#1d4ed8'
                            : '#111827',
                      }}
                    >
                      {m.body}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#6b7280',
                        marginTop: 2,
                      }}
                    >
                      {fmtDate(m.created_at)} ·{' '}
                      {m.sender_role || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px solid #111827',
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginBottom: 4,
                  }}
                >
                  Reply as breeder
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <input
                    style={INPUT_STYLE}
                    placeholder="Type your reply…"
                    value={newMessage}
                    onChange={(e) =>
                      setNewMessage(e.target.value)
                    }
                  />
                  <button
                    type="button"
                    style={PRIMARY_BUTTON_STYLE}
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ============================================================
   TRANSPORT TAB – transport requests & costs
   ============================================================ */

type TransportRow = {
  id: string
  buyer_id: string | null
  puppy_id: string | null
  trip_date: string | null
  from_location: string | null
  to_location: string | null
  status: string | null
  charge_amount: number | null
  credit_amount: number | null
  notes: string | null
}

function TransportTab() {
  const supabase = getBrowserClient()
  const [rows, setRows] = useState<TransportRow[]>([])
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [tRes, bRes] = await Promise.all([
          supabase
            .from(TBL_TRANSPORT)
            .select(
              'id,buyer_id,puppy_id,trip_date,from_location,to_location,status,charge_amount,credit_amount,notes'
            )
            .order('trip_date', { ascending: false }),
          supabase
            .from(TBL_BUYERS)
            .select('id,full_name,email,phone,city,state,created_at'),
        ])
        if (tRes.error) throw tRes.error
        if (bRes.error) throw bRes.error
        if (!cancelled) {
          setRows((tRes.data || []) as TransportRow[])
          setBuyers((bRes.data || []) as BuyerRow[])
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load transport data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const buyerMap = useMemo(() => {
    const m: Record<string, string> = {}
    buyers.forEach((b) => {
      m[b.id] = b.full_name
    })
    return m
  }, [buyers])

  async function handleSave(row: TransportRow) {
    setSavingId(row.id)
    try {
      const { error } = await supabase
        .from(TBL_TRANSPORT)
        .update({
          status: row.status || null,
          charge_amount: row.charge_amount,
          credit_amount: row.credit_amount,
          notes: row.notes || null,
        })
        .eq('id', row.id)
      if (error) throw error
    } catch (e: any) {
      setError(e?.message || 'Failed to save transport row.')
    } finally {
      setSavingId(null)
    }
  }

  function updateLocal(id: string, patch: Partial<TransportRow>) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
            }
          : r
      )
    )
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Transportation Requests</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Review each transport request, set status (pending / approved /
        denied / completed), and adjust charge / credit amounts as
        needed.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div style={PANEL_STYLE}>
        {loading && (
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Loading transportation records…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            No transport records yet.
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              fontSize: 12,
            }}
          >
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  borderRadius: 14,
                  border: '1px solid #1f2937',
                  padding: '8px 9px',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {buyerMap[r.buyer_id || ''] || 'Unknown buyer'}
                    </div>
                    <div style={{ color: '#9ca3af' }}>
                      {r.from_location || '—'} →{' '}
                      {r.to_location || '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{fmtDate(r.trip_date)}</div>
                    <div style={{ color: '#9ca3af' }}>
                      Status: {r.status || 'pending'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(120px,1fr))',
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <div style={{ color: '#9ca3af' }}>Status</div>
                    <select
                      style={SELECT_STYLE}
                      value={r.status || ''}
                      onChange={(e) =>
                        updateLocal(r.id, {
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">pending</option>
                      <option value="approved">approved</option>
                      <option value="denied">denied</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af' }}>
                      Charge Amount
                    </div>
                    <input
                      style={INPUT_STYLE}
                      value={
                        r.charge_amount != null
                          ? String(r.charge_amount)
                          : ''
                      }
                      onChange={(e) =>
                        updateLocal(r.id, {
                          charge_amount: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af' }}>
                      Credit Amount
                    </div>
                    <input
                      style={INPUT_STYLE}
                      value={
                        r.credit_amount != null
                          ? String(r.credit_amount)
                          : ''
                      }
                      onChange={(e) =>
                        updateLocal(r.id, {
                          credit_amount: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 6 }}>
                  <div style={{ color: '#9ca3af' }}>Notes</div>
                  <textarea
                    style={{
                      ...INPUT_STYLE,
                      minHeight: 50,
                      resize: 'vertical',
                    }}
                    value={r.notes || ''}
                    onChange={(e) =>
                      updateLocal(r.id, {
                        notes: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={() => handleSave(r)}
                  disabled={savingId === r.id}
                >
                  {savingId === r.id ? 'Saving…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ============================================================
   BREEDING PROGRAM TAB – manage breeding dogs, retire, notes
   ============================================================ */

type BreedingDogRow = {
  id: string
  name: string
  call_name: string | null
  sex: string | null
  registry: string | null
  color: string | null
  dob: string | null
  status: string | null
  notes: string | null
}

function BreedingTab() {
  const supabase = getBrowserClient()
  const [dogs, setDogs] = useState<BreedingDogRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newDog, setNewDog] = useState<{
    name: string
    call_name: string
    sex: string
    registry: string
    color: string
    dob: string
    notes: string
  }>({
    name: '',
    call_name: '',
    sex: '',
    registry: '',
    color: '',
    dob: '',
    notes: '',
  })

  const selected = useMemo(
    () => dogs.find((d) => d.id === selectedId) || null,
    [dogs, selectedId]
  )

  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const { data, error } = await supabase
          .from(TBL_BREED_DOGS)
          .select('*')
          .order('name', { ascending: true })
        if (error) throw error
        if (!cancelled) {
          const rows = (data || []) as BreedingDogRow[]
          setDogs(rows)
          if (!selectedId && rows.length) {
            setSelectedId(rows[0].id)
          }
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || 'Failed to load breeding dogs.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, selectedId])

  useEffect(() => {
    if (!selected) setEditNotes('')
    else setEditNotes(selected.notes || '')
  }, [selected])

  async function handleAddDog() {
    if (!newDog.name.trim()) return
    try {
      const { data, error } = await supabase
        .from(TBL_BREED_DOGS)
        .insert({
          name: newDog.name.trim(),
          call_name: newDog.call_name.trim() || null,
          sex: newDog.sex || null,
          registry: newDog.registry || null,
          color: newDog.color || null,
          dob: newDog.dob || null,
          status: 'active',
          notes: newDog.notes.trim() || null,
        })
        .select('*')
        .single()
      if (error) throw error
      const row = data as BreedingDogRow
      setDogs((prev) => [...prev, row])
      setNewDog({
        name: '',
        call_name: '',
        sex: '',
        registry: '',
        color: '',
        dob: '',
        notes: '',
      })
      setSelectedId(row.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to add breeding dog.')
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from(TBL_BREED_DOGS)
        .update({ status })
        .eq('id', id)
      if (error) throw error
      setDogs((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status,
              }
            : d
        )
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to update dog status.')
    }
  }

  async function saveNotes() {
    if (!selected) return
    try {
      const { error } = await supabase
        .from(TBL_BREED_DOGS)
        .update({ notes: editNotes.trim() || null })
        .eq('id', selected.id)
      if (error) throw error
      setDogs((prev) =>
        prev.map((d) =>
          d.id === selected.id
            ? {
                ...d,
                notes: editNotes.trim() || null,
              }
            : d
        )
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to save notes.')
    }
  }

  return (
    <>
      <h1 style={{ marginBottom: 4 }}>Breeding Program</h1>
      <p style={{ color: '#9ca3af', marginBottom: 14 }}>
        Track your breeding dogs, their status (active/retired), and
        internal notes (health, temperament, line info). This gives you
        a quick overview separate from the puppy sales side.
      </p>

      {error && (
        <div
          style={{
            ...PANEL_STYLE,
            borderColor: '#7f1d1d',
            background: '#451a1a',
            color: '#fecaca',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 14,
        }}
      >
        {/* List + add */}
        <div style={PANEL_STYLE}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Add Breeding Dog
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <input
              style={INPUT_STYLE}
              placeholder="Registered name"
              value={newDog.name}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Call name"
              value={newDog.call_name}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  call_name: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Sex (M/F)"
              value={newDog.sex}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  sex: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Registry"
              value={newDog.registry}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  registry: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              placeholder="Color"
              value={newDog.color}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  color: e.target.value,
                }))
              }
            />
            <input
              style={INPUT_STYLE}
              type="date"
              value={newDog.dob}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  dob: e.target.value,
                }))
              }
            />
            <textarea
              style={{
                ...INPUT_STYLE,
                minHeight: 50,
                resize: 'vertical',
              }}
              placeholder="Notes (health, temperament, line info, etc.)"
              value={newDog.notes}
              onChange={(e) =>
                setNewDog((v) => ({
                  ...v,
                  notes: e.target.value,
                }))
              }
            />
            <button
              type="button"
              style={PRIMARY_BUTTON_STYLE}
              onClick={handleAddDog}
            >
              Save Breeding Dog
            </button>
          </div>

          <div
            style={{
              borderTop: '1px solid #111827',
              paddingTop: 8,
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            All Breeding Dogs
          </div>
          <div
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              paddingRight: 4,
              fontSize: 12,
            }}
          >
            {dogs.length === 0 && (
              <div style={{ color: '#6b7280' }}>
                No breeding dogs recorded yet.
              </div>
            )}
            {dogs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 10,
                  border:
                    selectedId === d.id
                      ? '1px solid #e0a96d'
                      : '1px solid #111827',
                  padding: '6px 8px',
                  marginBottom: 5,
                  background:
                    selectedId === d.id ? '#111827' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: '#9ca3af' }}>
                  {d.call_name || '—'} · {d.sex || '—'} ·{' '}
                  {d.status || 'active'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={PANEL_STYLE}>
          {!selected && (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Select a breeding dog on the left to see details and
              update notes or status.
            </div>
          )}
          {selected && (
            <>
              <h2 style={{ marginTop: 0, marginBottom: 4 }}>
                {selected.name}
              </h2>
              <div
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                {selected.call_name || 'No call name'} ·{' '}
                {selected.sex || '—'} · {selected.registry || '—'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginBottom: 8,
                }}
              >
                DOB: {fmtDate(selected.dob)} · Status:{' '}
                {selected.status || 'active'} · Color:{' '}
                {selected.color || '—'}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={() => setStatus(selected.id, 'active')}
                >
                  Mark Active
                </button>
                <button
                  type="button"
                  style={{
                    ...PRIMARY_BUTTON_STYLE,
                    background: '#4b5563',
                    color: '#e5e7eb',
                  }}
                  onClick={() => setStatus(selected.id, 'retired')}
                >
                  Mark Retired
                </button>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginBottom: 4,
                  }}
                >
                  Internal Notes
                </div>
                <textarea
                  style={{
                    ...INPUT_STYLE,
                    minHeight: 120,
                    resize: 'vertical',
                  }}
                  value={editNotes}
                  onChange={(e) =>
                    setEditNotes(e.target.value)
                  }
                />
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    style={PRIMARY_BUTTON_STYLE}
                    onClick={saveNotes}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
// ============================================
// Breeding Program types
// ============================================

type BreedingDogRow = {
  id: string;
  name?: string | null;
  call_name?: string | null;
  sex?: string | null;
  dob?: string | null;
  registry?: string | null;
  registration_number?: string | null;
  origin?: string | null;
  price_paid?: number | null;
  retained?: boolean | null;
};

type DogLitterRow = {
  id: string;
  litter_name?: string | null;
  whelp_date?: string | null;
  expected_date?: string | null;
};

type DogPuppyRow = {
  id: string;
  name?: string | null;
  status?: string | null;
  price?: number | null;
  litter_id?: string | null;
};

type YearStat = {
  year: string;
  litters: number;
  puppies: number;
  totalSales: number;
};

// ============================================
// Breeding Program view
// ============================================

function BreedingProgramView() {
  const [dogs, setDogs] = useState<BreedingDogRow[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detail, setDetail] = useState<{
    dog: BreedingDogRow;
    litters: DogLitterRow[];
    puppies: DogPuppyRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    name: "",
    call_name: "",
    sex: "female",
    dob: "",
    registry: "",
    registration_number: "",
    origin: "",
  });

  // Load list of breeding dogs once
  useEffect(() => {
    let alive = true;
    async function loadDogs() {
      try {
        setLoadingList(true);
        const supabase = getBrowserClient();
        const { data, error: err } = await supabase
          .from("breeding_dogs")
          .select(
            "id, name, call_name, sex, dob, registry, registration_number, origin, price_paid, retained, created_at"
          )
          .order("name", { ascending: true });

        if (!alive) return;
        if (err) throw err;

        const rows = (data ?? []) as BreedingDogRow[];
        setDogs(rows);
        if (!selectedDogId && rows[0]) {
          setSelectedDogId(rows[0].id);
        }
      } catch (e: any) {
        if (!alive) return;
        console.error(e);
        setError(e?.message ?? "Failed to load breeding dogs.");
      } finally {
        if (alive) setLoadingList(false);
      }
    }

    loadDogs();
    return () => {
      alive = false;
    };
  }, []);

  // Load details for the selected dog
  useEffect(() => {
    if (!selectedDogId) {
      setDetail(null);
      return;
    }

    let alive = true;

    async function loadDetail() {
      try {
        setLoadingDetail(true);
        setError(null);
        const supabase = getBrowserClient();

        const { data: dogRow, error: dogErr } = await supabase
          .from("breeding_dogs")
          .select(
            "id, name, call_name, sex, dob, registry, registration_number, origin, price_paid, retained, created_at"
          )
          .eq("id", selectedDogId)
          .maybeSingle();

        if (!alive) return;
        if (dogErr) throw dogErr;
        if (!dogRow) {
          setDetail(null);
          return;
        }

        const dog = dogRow as BreedingDogRow;

        const { data: litterRows, error: litterErr } = await supabase
          .from("puppy_litters")
          .select("id, litter_name, whelp_date, expected_date")
          .or(`dam_id.eq.${selectedDogId},sire_id.eq.${selectedDogId}`)
          .order("whelp_date", { ascending: false });

        if (!alive) return;
        if (litterErr) throw litterErr;

        const litters = (litterRows ?? []) as DogLitterRow[];

        let puppies: DogPuppyRow[] = [];
        if (litters.length) {
          const litterIds = litters.map((l) => l.id);
          const { data: puppyRows, error: puppyErr } = await supabase
            .from("puppies")
            .select("id, name, status, price, litter_id")
            .in("litter_id", litterIds);

          if (!alive) return;
          if (puppyErr) throw puppyErr;

          puppies = (puppyRows ?? []) as DogPuppyRow[];
        }

        setDetail({ dog, litters, puppies });
      } catch (e: any) {
        if (!alive) return;
        console.error(e);
        setError(e?.message ?? "Failed to load breeding dog details.");
      } finally {
        if (alive) setLoadingDetail(false);
      }
    }

    loadDetail();

    return () => {
      alive = false;
    };
  }, [selectedDogId]);

  // Add a new breeding dog
  async function handleAddDog(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (!addForm.name.trim()) {
        throw new Error("Please enter a name for the dog.");
      }
      const supabase = getBrowserClient();
      const { data, error: insertErr } = await supabase
        .from("breeding_dogs")
        .insert([
          {
            name: addForm.name.trim(),
            call_name: addForm.call_name.trim() || null,
            sex: addForm.sex,
            dob: addForm.dob || null,
            registry: addForm.registry || null,
            registration_number: addForm.registration_number || null,
            origin: addForm.origin || null,
          },
        ])
        .select(
          "id, name, call_name, sex, dob, registry, registration_number, origin, price_paid, retained, created_at"
        )
        .maybeSingle();

      if (insertErr) throw insertErr;
      const newDog = data as BreedingDogRow;
      const next = [...dogs, newDog].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setDogs(next);
      setSelectedDogId(newDog.id);
      setAddOpen(false);
      setAddForm({
        name: "",
        call_name: "",
        sex: "female",
        dob: "",
        registry: "",
        registration_number: "",
        origin: "",
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to add breeding dog.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US");
  }

  const shellStyle: React.CSSProperties = {
    marginTop: 8,
    display: "grid",
    gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)",
    gap: 16,
    alignItems: "flex-start",
  };

  const leftCardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid #1f2937",
    background: "#020617",
    padding: 16,
    boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
  };

  const rightCardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid #1f2937",
    background: "#020617",
    padding: 16,
    boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    border: "1px solid #1f2937",
    background: "#0b1120",
  };

  // Aggregate yearly stats for this dog
  let yearStats: YearStat[] = [];
  let totalLitters = 0;
  let totalPuppies = 0;
  let totalSales = 0;

  if (detail) {
    const map: { [year: string]: YearStat } = {};
    const litterYear: { [id: string]: string } = {};

    detail.litters.forEach((l) => {
      const base = l.whelp_date || l.expected_date || "";
      const year = base ? base.slice(0, 4) : "Unknown";
      const key = year || "Unknown";
      litterYear[l.id] = key;
      if (!map[key]) {
        map[key] = { year: key, litters: 0, puppies: 0, totalSales: 0 };
      }
      map[key].litters += 1;
    });

    detail.puppies.forEach((p) => {
      const lid = p.litter_id || "";
      const key = lid ? litterYear[lid] || "Unknown" : "Unknown";
      if (!map[key]) {
        map[key] = { year: key, litters: 0, puppies: 0, totalSales: 0 };
      }
      map[key].puppies += 1;
      const price =
        typeof p.price === "number"
          ? p.price
          : parseFloat(String(p.price ?? "0")) || 0;
      map[key].totalSales += price;
    });

    yearStats = Object.values(map).sort((a, b) => b.year.localeCompare(a.year));
    totalLitters = yearStats.reduce((sum, s) => sum + s.litters, 0);
    totalPuppies = yearStats.reduce((sum, s) => sum + s.puppies, 0);
    totalSales = yearStats.reduce((sum, s) => sum + s.totalSales, 0);
  }

  // Group puppies by litter for display
  const pupsByLitter: Record<string, DogPuppyRow[]> = {};
  if (detail) {
    detail.puppies.forEach((p) => {
      const lid = p.litter_id;
      if (!lid) return;
      if (!pupsByLitter[lid]) pupsByLitter[lid] = [];
      pupsByLitter[lid].push(p);
    });
  }

  return (
    <section style={shellStyle}>
      {/* LEFT: list of breeding dogs */}
      <aside style={leftCardStyle}>
        <header style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Breeding Dogs</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>
            Manage your active sires and dams in the program.
          </p>
        </header>

        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: "8px 10px",
            borderRadius: 999,
            border: "1px solid #1f2937",
            background: addOpen
              ? "linear-gradient(135deg,#e0a96d,#c47a35)"
              : "#020617",
            color: addOpen ? "#111827" : "#e5e7eb",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {addOpen ? "Cancel" : "+ New Breeding Dog"}
        </button>

        {addOpen && (
          <form onSubmit={handleAddDog} style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, opacity: 0.8 }}>Name</label>
              <input
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "6px 8px",
                  fontSize: 13,
                  marginTop: 2,
                  background: "#020617",
                  color: "#e5e7eb",
                }}
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, opacity: 0.8 }}>Call Name</label>
              <input
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "6px 8px",
                  fontSize: 13,
                  marginTop: 2,
                  background: "#020617",
                  color: "#e5e7eb",
                }}
                value={addForm.call_name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, call_name: e.target.value }))
                }
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <div>
                <label style={{ fontSize: 11, opacity: 0.8 }}>Sex</label>
                <select
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #1f2937",
                    padding: "6px 8px",
                    fontSize: 13,
                    marginTop: 2,
                    background: "#020617",
                    color: "#e5e7eb",
                  }}
                  value={addForm.sex}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, sex: e.target.value }))
                  }
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, opacity: 0.8 }}>
                  DOB (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #1f2937",
                    padding: "6px 8px",
                    fontSize: 13,
                    marginTop: 2,
                    background: "#020617",
                    color: "#e5e7eb",
                  }}
                  value={addForm.dob}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, dob: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, opacity: 0.8 }}>Registry</label>
              <input
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "6px 8px",
                  fontSize: 13,
                  marginTop: 2,
                  background: "#020617",
                  color: "#e5e7eb",
                }}
                value={addForm.registry}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, registry: e.target.value }))
                }
                placeholder="AKC / CKC / ACA"
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, opacity: 0.8 }}>
                Registration #
              </label>
              <input
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "6px 8px",
                  fontSize: 13,
                  marginTop: 2,
                  background: "#020617",
                  color: "#e5e7eb",
                }}
                value={addForm.registration_number}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    registration_number: e.target.value,
                  }))
                }
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, opacity: 0.8 }}>
                From (Location)
              </label>
              <input
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  padding: "6px 8px",
                  fontSize: 13,
                  marginTop: 2,
                  background: "#020617",
                  color: "#e5e7eb",
                }}
                value={addForm.origin}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, origin: e.target.value }))
                }
                placeholder="City, State or breeder"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid #1f2937",
                background: "linear-gradient(135deg,#e0a96d,#c47a35)",
                color: "#111827",
                fontSize: 13,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "Save Breeding Dog"}
            </button>
          </form>
        )}

        {loadingList && (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Loading breeding dogs…</p>
        )}

        {!loadingList && dogs.length === 0 && (
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            No breeding dogs have been added yet.
          </p>
        )}

        {!loadingList && dogs.length > 0 && (
          <div
            style={{
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 420,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {dogs.map((dog) => {
              const isActive = dog.id === selectedDogId;
              const initials = (dog.name || "?")
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <button
                  key={dog.id}
                  type="button"
                  onClick={() => setSelectedDogId(dog.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: isActive
                      ? "1px solid #e0a96d"
                      : "1px solid #1f2937",
                    background: isActive ? "#111827" : "#020617",
                    padding: "8px 9px",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "999px",
                      background:
                        "radial-gradient(circle at 30% 20%,#facc15,#e0a96d)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {dog.name || "Unnamed"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.75,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {dog.call_name ? `“${dog.call_name}” • ` : ""}
                      {dog.registry || "Unregistered"}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                      DOB: {formatDate(dog.dob)} • From: {dog.origin || "—"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* RIGHT: selected dog profile + stats */}
      <section style={rightCardStyle}>
        {error && (
          <div
            style={{
              marginBottom: 10,
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #7f1d1d",
              background: "#450a0a",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        {!selectedDogId && (
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            Select a dog on the left to see their profile and program stats.
          </p>
        )}

        {selectedDogId && loadingDetail && (
          <p style={{ fontSize: 13, opacity: 0.8 }}>Loading dog details…</p>
        )}

        {detail && !loadingDetail && (
          <>
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {detail.dog.name || "Unnamed"}
                </h2>
                {detail.dog.call_name && (
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    “{detail.dog.call_name}”
                  </p>
                )}
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  DOB: {formatDate(detail.dog.dob)} • Registry:{" "}
                  {detail.dog.registry || "Unregistered"}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {detail.dog.sex && (
                  <span style={badgeStyle}>
                    {detail.dog.sex === "female" ? "Dam" : "Sire"}
                  </span>
                )}
                {detail.dog.retained && (
                  <span style={badgeStyle}>Retained by breeder</span>
                )}
              </div>
            </header>

            {/* Program overview fields */}
            <section
              style={{
                marginTop: 4,
                paddingTop: 8,
                borderTop: "1px solid #1f2937",
              }}
            >
              <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>
                Program Overview
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div>
                  <div style={{ opacity: 0.7 }}>Registered Name</div>
                  <div>{detail.dog.name || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7 }}>Call Name</div>
                  <div>{detail.dog.call_name || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7 }}>Registry</div>
                  <div>{detail.dog.registry || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7 }}>Registration #</div>
                  <div>{detail.dog.registration_number || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7 }}>From (Location)</div>
                  <div>{detail.dog.origin || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7 }}>Price Paid / Value</div>
                  <div>
                    {typeof detail.dog.price_paid === "number"
                      ? `$${detail.dog.price_paid.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`
                      : "—"}
                  </div>
                </div>
              </div>
            </section>

            {/* Litters + puppy stats */}
            <section
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: "1px solid #1f2937",
              }}
            >
              <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>
                Litters & Puppy Production
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    padding: "8px 10px",
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    Total Litters
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {totalLitters}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    padding: "8px 10px",
                    minWidth: 140,
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    Total Puppies
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {totalPuppies}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    padding: "8px 10px",
                    minWidth: 160,
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    Puppy Sales (All Years)
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {`$${totalSales.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`}
                  </div>
                </div>
              </div>

              {yearStats.length > 0 ? (
                <div
                  style={{
                    overflowX: "auto",
                    marginTop: 4,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: "left" }}>
                        <th
                          style={{
                            borderBottom: "1px solid #1f2937",
                            padding: "4px 6px",
                          }}
                        >
                          Year
                        </th>
                        <th
                          style={{
                            borderBottom: "1px solid #1f2937",
                            padding: "4px 6px",
                          }}
                        >
                          Litters
                        </th>
                        <th
                          style={{
                            borderBottom: "1px solid #1f2937",
                            padding: "4px 6px",
                          }}
                        >
                          Puppies
                        </th>
                        <th
                          style={{
                            borderBottom: "1px solid #1f2937",
                            padding: "4px 6px",
                          }}
                        >
                          Puppy Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearStats.map((row) => (
                        <tr key={row.year}>
                          <td
                            style={{
                              borderBottom: "1px solid #020617",
                              padding: "4px 6px",
                            }}
                          >
                            {row.year}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #020617",
                              padding: "4px 6px",
                            }}
                          >
                            {row.litters}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #020617",
                              padding: "4px 6px",
                            }}
                          >
                            {row.puppies}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #020617",
                              padding: "4px 6px",
                            }}
                          >
                            {`$${row.totalSales.toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  No litters or puppies recorded yet for this dog.
                </p>
              )}
            </section>

            {/* Litters detail with puppy chips */}
            <section
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: "1px solid #1f2937",
              }}
            >
              <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>
                Litters (Detail)
              </h3>
              {detail.litters.length === 0 && (
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  No litters have been linked to this dog yet.
                </p>
              )}
              {detail.litters.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  {detail.litters.map((litter) => {
                    const pups = pupsByLitter[litter.id] || [];
                    return (
                      <div
                        key={litter.id}
                        style={{
                          borderRadius: 10,
                          border: "1px solid #1f2937",
                          padding: "6px 8px",
                          background: "#020617",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              {litter.litter_name || "Unnamed litter"}
                            </div>
                            <div style={{ opacity: 0.7 }}>
                              Whelped:{" "}
                              {formatDate(
                                litter.whelp_date || litter.expected_date
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ opacity: 0.7 }}>Puppies</div>
                            <div style={{ fontWeight: 600 }}>
                              {pups.length}
                            </div>
                          </div>
                        </div>
                        {pups.length > 0 && (
                          <div
                            style={{
                              marginTop: 4,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {pups.map((p) => (
                              <span
                                key={p.id}
                                style={{
                                  borderRadius: 999,
                                  border: "1px solid #1f2937",
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  opacity: 0.85,
                                }}
                              >
                                {p.name || "Puppy"} •{" "}
                                {p.status || "status unknown"} •{" "}
                                {typeof p.price === "number"
                                  ? `$${p.price.toLocaleString("en-US", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}`
                                  : "no price"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </section>
  );
}
