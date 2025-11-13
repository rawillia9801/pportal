'use client'

/* ============================================
   CHANGELOG
   - 2025-11-12: Admin Dashboard shell with left tabs
   - 2025-11-12: Buyers tab (list + detail panel)
   - 2025-11-12: Supabase wiring for buyers, puppies,
                 payments, transport_requests
   ============================================
   ANCHOR: ADMIN_DASHBOARD
   Suggested route: src/app/admin/page.tsx
   ============================================ */

import React, { useEffect, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ============================================
   ANCHOR: SUPABASE_HELPERS
   ============================================ */

type AnyClient = SupabaseClient
let __sb: AnyClient | null = null

function getSupabaseEnv() {
  const g: any = (typeof window !== 'undefined' ? window : globalThis) as any
  const hasProc = typeof process !== 'undefined' && (process as any) && (process as any).env
  const url = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL
    : (g.NEXT_PUBLIC_SUPABASE_URL || g.__ENV?.NEXT_PUBLIC_SUPABASE_URL || '')
  const key = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : (g.NEXT_PUBLIC_SUPABASE_ANON_KEY || g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  return { url: String(url || ''), key: String(key || '') }
}

async function getBrowserClient(): Promise<AnyClient> {
  if (__sb) return __sb
  const { url, key } = getSupabaseEnv()
  if (!url || !key)
    throw new Error('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  __sb = createClient(url, key)
  return __sb
}

/* ============================================
   ANCHOR: TYPES
   ============================================ */

type AdminTabKey =
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

type PuppySummary = {
  id: string
  name: string | null
  status: string | null
  price: number | null
  dam_name: string | null
}

type PaymentSummary = {
  id: string
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
  puppy_name: string | null
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

/* ============================================
   ANCHOR: ROOT COMPONENT
   ============================================ */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('buyers')

  return (
    <main className="adminLayout">
      {/* SIDEBAR */}
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="adminLogo">🐶</div>
          <div>
            <div className="brandLine1">SWVA Chihuahua</div>
            <div className="brandLine2">Admin Panel</div>
          </div>
        </div>

        <nav className="adminTabs">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`adminTab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN PANEL */}
      <section className="adminMain">
        {activeTab === 'buyers' && <BuyersView />}

        {activeTab !== 'buyers' && (
          <div className="comingSoon">
            <h1>{ADMIN_TABS.find((t) => t.key === activeTab)?.label}</h1>
            <p>We’ll wire this section after Buyers is complete.</p>
          </div>
        )}

        <style jsx>{`
          :root {
            --bg: #020617;
            --panel: #020617;
            --ink: #f9fafb;
            --muted: #9ca3af;
            --brand: #e0a96d;
            --brandAlt: #c47a35;
          }

          main.adminLayout {
            min-height: 100vh;
            display: flex;
            background:
              radial-gradient(60% 100% at 100% 0%, #0b1120 0%, transparent 60%),
              radial-gradient(60% 100% at 0% 0%, #020617 0%, transparent 60%),
              var(--bg);
            color: var(--ink);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .adminSidebar {
            width: 240px;
            padding: 18px 14px;
            box-sizing: border-box;
            border-right: 1px solid #1f2937;
            background: linear-gradient(180deg, #020617, #111827);
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .adminBrand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .adminLogo {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--brand), var(--brandAlt));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }
          .brandLine1 {
            font-weight: 700;
            font-size: 0.95rem;
          }
          .brandLine2 {
            font-size: 0.8rem;
            color: #e5e7eb;
          }

          .adminTabs {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .adminTab {
            border: 1px solid #1f2937;
            background: #020617;
            color: #e5e7eb;
            border-radius: 10px;
            padding: 9px 10px;
            text-align: left;
            font-size: 0.9rem;
            cursor: pointer;
            transition:
              background 0.12s ease,
              transform 0.12s ease,
              box-shadow 0.12s ease,
              border-color 0.12s ease;
          }
          .adminTab:hover {
            background: #111827;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            border-color: #334155;
          }
          .adminTab.active {
            background: linear-gradient(135deg, var(--brand), var(--brandAlt));
            color: #111827;
            border-color: transparent;
            font-weight: 600;
          }

          .adminMain {
            flex: 1;
            padding: 20px 22px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .comingSoon {
            margin: auto;
            text-align: center;
            color: var(--muted);
          }
          .comingSoon h1 {
            margin-bottom: 8px;
          }

          @media (max-width: 800px) {
            main.adminLayout {
              flex-direction: column;
            }
            .adminSidebar {
              width: 100%;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            }
            .adminTabs {
              flex-direction: row;
              flex-wrap: wrap;
            }
          }
        `}</style>
      </section>
    </main>
  )
}

/* ============================================
   ANCHOR: BUYERS_VIEW
   ============================================ */

function BuyersView() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BuyerDetail | null>(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simple “add buyer” form
  const [newBuyerName, setNewBuyerName] = useState('')
  const [newBuyerEmail, setNewBuyerEmail] = useState('')
  const [newBuyerPhone, setNewBuyerPhone] = useState('')
  const [savingBuyer, setSavingBuyer] = useState(false)

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
            .select('id, full_name, email, phone, address_line1, city, state, postal_code, created_at, notes')
            .eq('id', selectedId)
            .single(),
          sb
            .from('puppies')
            .select('id, name, status, price, dam_id')
            .eq('buyer_id', selectedId)
            .order('created_at', { ascending: false }),
          sb
            .from('puppy_payments')
            .select('id, type, amount, payment_date, method, puppy_id')
            .eq('buyer_id', selectedId)
            .order('payment_date', { ascending: false }),
          sb
            .from('transport_requests')
            .select('id, trip_date, from_location, to_location, miles, tolls, hotel_cost, fuel_cost')
            .eq('buyer_id', selectedId)
            .order('trip_date', { ascending: false }),
        ])

        if (buyerRes.error) throw buyerRes.error
        if (puppiesRes.error) throw puppiesRes.error
        if (payRes.error) throw payRes.error
        if (transRes.error) throw transRes.error

        const buyer = buyerRes.data as BuyerDetail['buyer']
        const puppies = (puppiesRes.data || []) as PuppySummary[]

        // We’ll attach puppy names to payments on the client side for now
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

  return (
    <div className="buyersWrapper">
      <header className="buyersHeader">
        <div>
          <h1>Buyers</h1>
          <p className="muted">
            Manage your approved families, their puppies, payment history, and transportation details.
          </p>
        </div>
      </header>

      {/* Add Buyer Card */}
      <section className="addBuyerCard">
        <h2>Add Buyer</h2>
        <p className="muted">You can also auto-create buyers later from approved applications.</p>
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
        {/* LEFT: list of buyers */}
        <div className="buyersListCard">
          <div className="buyersListHeader">
            <h3>All Buyers</h3>
            {loadingList && <span className="miniTag">Loading…</span>}
          </div>
          <div className="buyersList">
            {buyers.length === 0 && !loadingList && (
              <div className="emptyState">No buyers yet. Add your first buyer above.</div>
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

        {/* RIGHT: buyer detail */}
        <div className="buyerDetailCard">
          {(!detail || loadingDetail) && (
            <div className="detailPlaceholder">
              {loadingDetail ? 'Loading buyer details…' : 'Select a buyer from the list.'}
            </div>
          )}

          {detail && !loadingDetail && (
            <>
              <div className="buyerDetailHeader">
                <div>
                  <h2>{detail.buyer.full_name}</h2>
                  <p className="muted">
                    {detail.buyer.city && (
                      <>
                        {detail.buyer.city}
                        {detail.buyer.state ? `, ${detail.buyer.state}` : ''}
                      </>
                    )}
                    {!detail.buyer.city && 'Buyer details'}
                  </p>
                </div>
              </div>

              {/* CONTACT */}
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
                      {detail.buyer.address_line1 && <div>{detail.buyer.address_line1}</div>}
                      {(detail.buyer.city || detail.buyer.state || detail.buyer.postal_code) && (
                        <div>
                          {detail.buyer.city}
                          {detail.buyer.state ? `, ${detail.buyer.state}` : ''}
                          {detail.buyer.postal_code ? ` ${detail.buyer.postal_code}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* PUPPIES */}
              <section className="detailSection">
                <h3>Puppies</h3>
                {detail.puppies.length === 0 && <div className="emptyLine">No puppies assigned yet.</div>}
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
                        <span className="clickableName">{p.name || 'Unnamed'}</span>
                        <span>{p.status || '—'}</span>
                        <span>{p.dam_name || '—'}</span>
                        <span>{p.price != null ? `$${p.price.toFixed(2)}` : '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PAYMENTS */}
              <section className="detailSection">
                <h3>Payments</h3>
                {detail.payments.length === 0 && <div className="emptyLine">No payments recorded.</div>}
                {detail.payments.length > 0 && (
                  <div className="table">
                    <div className="tableHead">
                      <span>Date</span>
                      <span>Type</span>
                      <span>Puppy</span>
                      <span>Amount</span>
                    </div>
                    {detail.payments.map((p) => (
                      <div key={p.id} className="tableRow">
                        <span>{p.payment_date ? p.payment_date.slice(0, 10) : '—'}</span>
                        <span>{p.type || '—'}</span>
                        <span>{p.puppy_name || '—'}</span>
                        <span>{p.amount != null ? `$${p.amount.toFixed(2)}` : '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* TRANSPORT */}
              <section className="detailSection">
                <h3>Transportation</h3>
                {detail.transports.length === 0 && <div className="emptyLine">No trips recorded.</div>}
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
                        <span>{t.trip_date ? t.trip_date.slice(0, 10) : '—'}</span>
                        <span>
                          {t.from_location || '—'} → {t.to_location || '—'}
                        </span>
                        <span>{t.miles != null ? t.miles.toFixed(1) : '—'}</span>
                        <span>
                          {[
                            t.tolls || 0,
                            t.hotel_cost || 0,
                            t.fuel_cost || 0,
                          ].some((v) => v > 0)
                            ? `$${(((t.tolls || 0) + (t.hotel_cost || 0) + (t.fuel_cost || 0)) as number).toFixed(2)}`
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
          color: var(--muted);
        }

        .addBuyerCard {
          background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 1));
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
          color: var(--muted);
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
          color: var(--muted);
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
          color: var(--muted);
        }
        .buyerDetailHeader h2 {
          margin: 0 0 2px;
        }
        .buyerDetailHeader .muted {
          margin: 0;
          color: var(--muted);
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
          color: var(--muted);
          margin-bottom: 2px;
        }

        .emptyState,
        .emptyLine {
          font-size: 0.9rem;
          color: var(--muted);
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

        .clickableName {
          text-decoration: underline;
          cursor: pointer;
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
