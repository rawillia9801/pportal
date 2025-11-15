'use client'

/* ============================================
   /admin/buyers

   Uses Supabase tables:
   - puppy_buyers
   - puppies
   - puppy_payments

   Features:
   - Search buyers (name/email/phone)
   - Add / edit / delete buyers
   - Track buyer source (GoodDog, Website, Facebook, Referral, Other)
   - "Puppy Payments" flag (on_payment_plan)
   - Payment plan cards (if on plan):
       • Plan start date
       • Due day of month
       • Min payment
       • Amount paid
       • Remaining balance
       • Plan status (current / past_due / write_off / collections)
   - Buyer detail view:
       • Contact info (editable)
       • Financial summary (base price, admin fee, credits, deposits,
         other payments, credits, refunds, total paid, balance)
       • Payment plan summary + editable fields
       • Puppies adopted count (clickable → /admin/puppies?buyer=id)
       • Puppy list (click puppy → right-side detail panel)
       • Deposits list
       • All payments list
   ============================================ */

import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'

/* ---------- types ---------- */

type BuyerRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  base_price: number | null
  credits: number | null
  admin_fee_financing: number | null
  source: string | null
  on_payment_plan: boolean | null
  plan_start_date: string | null
  plan_due_day: number | null
  plan_status: string | null
  plan_min_payment: number | null
  created_at: string
}

type BuyerDetailBuyer = BuyerRow & {
  address_line1: string | null
  postal_code: string | null
  notes: string | null
}

type PuppySummary = {
  id: string
  buyer_id: string | null
  name: string | null
  status: string | null
  price: number | null
}

type PaymentRecord = {
  id: string
  buyer_id: string | null
  puppy_id: string | null
  type: string | null
  amount: number | null
  payment_date: string | null
  method: string | null
  notes: string | null
}

type BuyerDetail = {
  buyer: BuyerDetailBuyer
  puppies: PuppySummary[]
  payments: PaymentRecord[]
}

type PuppyDetail = any // full row from puppies; rendered generically

/* ---------- helpers ---------- */

function fmtCurrency(v: number | null | undefined): string {
  const n =
    typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v) ? v : 0
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

function safeNum(v: string): number | null {
  if (!v.trim()) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/* ---------- shared inline styles ---------- */

const panelStyle: CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(15,23,42,0.12)',
  background: '#ffffff',
  boxShadow: '0 16px 40px rgba(15,23,42,0.10)',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '7px 9px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 13,
}

const selectStyle: CSSProperties = {
  ...inputStyle,
}

const primaryBtn: CSSProperties = {
  borderRadius: 999,
  border: '1px solid transparent',
  padding: '7px 13px',
  fontSize: 13,
  fontWeight: 600,
  background: 'linear-gradient(135deg,#fbbf24,#f97316)', // warm gold/orange
  color: '#111827',
  cursor: 'pointer',
}

const dangerBtn: CSSProperties = {
  borderRadius: 999,
  border: '1px solid #fee2e2',
  padding: '6px 11px',
  fontSize: 12,
  background: '#fef2f2',
  color: '#b91c1c',
  cursor: 'pointer',
}

const pillLabel: CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.05,
  color: '#6b7280',
}

const pillValue: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
}

/* ============================================
   PAGE
   ============================================ */

export default function BuyersPage() {
  const sb = getBrowserClient()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BuyerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [puppyFocusId, setPuppyFocusId] = useState<string | null>(null)
  const [puppyDetail, setPuppyDetail] = useState<PuppyDetail | null>(null)
  const [puppyLoading, setPuppyLoading] = useState(false)

  // new buyer form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newOnPlan, setNewOnPlan] = useState(false)
  const [savingBuyer, setSavingBuyer] = useState(false)

  // editable buyer fields
  const [editBuyer, setEditBuyer] = useState<BuyerDetailBuyer | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // financial edit
  const [priceEdit, setPriceEdit] = useState('')
  const [creditsEdit, setCreditsEdit] = useState('')
  const [adminFeeEdit, setAdminFeeEdit] = useState('')
  const [savingFinancials, setSavingFinancials] = useState(false)

  // payment plan edit
  const [planOn, setPlanOn] = useState(false)
  const [planStart, setPlanStart] = useState('')
  const [planDueDay, setPlanDueDay] = useState('')
  const [planStatus, setPlanStatus] = useState('')
  const [planMinPayment, setPlanMinPayment] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)

  // manual payment
  const [payType, setPayType] = useState('payment')
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)

  // delete buyer
  const [deleting, setDeleting] = useState(false)

  /* ---------- load buyers list ---------- */

  async function loadBuyers(term: string | null = null) {
    setLoadingList(true)
    setListError(null)
    try {
      let query = sb
        .from('puppy_buyers')
        .select(
          'id, full_name, email, phone, city, state, base_price, credits, admin_fee_financing, source, on_payment_plan, plan_start_date, plan_due_day, plan_status, plan_min_payment, created_at'
        )
        .order('created_at', { ascending: false })

      const t = (term ?? '').trim()
      if (t) {
        query = query.or(
          `full_name.ilike.%${t}%,email.ilike.%${t}%,phone.ilike.%${t}%`
        )
      }

      const { data, error } = await query
      if (error) throw error
      setBuyers((data ?? []) as BuyerRow[])
    } catch (e: any) {
      setListError(e?.message || 'Failed to load buyers.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadBuyers()
  }, [])

  /* ---------- select buyer & load detail ---------- */

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setEditBuyer(null)
      setPuppyFocusId(null)
      setPuppyDetail(null)
      return
    }

    let cancelled = false
    ;(async () => {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const buyerRes = await sb
          .from('puppy_buyers')
          .select(
            'id, full_name, email, phone, city, state, address_line1, postal_code, notes, base_price, credits, admin_fee_financing, source, on_payment_plan, plan_start_date, plan_due_day, plan_status, plan_min_payment, created_at'
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

        if (cancelled) return

        const buyer = buyerRes.data as BuyerDetailBuyer
        const puppies = (puppiesRes.data ?? []) as PuppySummary[]
        const payments = (paymentsRes.data ?? []) as PaymentRecord[]

        setDetail({ buyer, puppies, payments })
        setEditBuyer(buyer)

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

        setPlanOn(!!buyer.on_payment_plan)
        setPlanStart(buyer.plan_start_date || '')
        setPlanDueDay(
          buyer.plan_due_day != null ? String(buyer.plan_due_day) : ''
        )
        setPlanStatus(buyer.plan_status || '')
        setPlanMinPayment(
          buyer.plan_min_payment != null
            ? String(buyer.plan_min_payment)
            : ''
        )
      } catch (e: any) {
        if (!cancelled)
          setDetailError(e?.message || 'Failed to load buyer.')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedId, sb])

  /* ---------- puppy detail for clicked puppy ---------- */

  useEffect(() => {
    if (!puppyFocusId) {
      setPuppyDetail(null)
      return
    }
    let cancelled = false
    ;(async () => {
      setPuppyLoading(true)
      try {
        const { data, error } = await sb
          .from('puppies')
          .select('*')
          .eq('id', puppyFocusId)
          .maybeSingle()
        if (error) throw error
        if (cancelled) return
        setPuppyDetail(data)
      } catch {
        if (!cancelled) setPuppyDetail(null)
      } finally {
        if (!cancelled) setPuppyLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [puppyFocusId, sb])

  /* ---------- derived financials ---------- */

  const financials = useMemo(() => {
    if (!detail) {
      return {
        basePrice: 0,
        adminFee: 0,
        credits: 0,
        depositTotal: 0,
        otherPaymentTotal: 0,
        extraCreditTotal: 0,
        refundTotal: 0,
        totalPaid: 0,
        invoiceTotal: 0,
        balance: 0,
      }
    }

    const b = detail.buyer
    const basePrice = b.base_price ?? 0
    const adminFee = b.admin_fee_financing ?? 0
    const credits = b.credits ?? 0

    let depositTotal = 0
    let otherPaymentTotal = 0
    let extraCreditTotal = 0
    let refundTotal = 0

    for (const p of detail.payments) {
      const amt = p.amount ?? 0
      if (p.type === 'deposit') depositTotal += amt
      else if (p.type === 'payment') otherPaymentTotal += amt
      else if (p.type === 'credit') extraCreditTotal += amt
      else if (p.type === 'refund') refundTotal += amt
    }

    const totalPaid =
      depositTotal + otherPaymentTotal + extraCreditTotal - refundTotal
    const invoiceTotal = basePrice + adminFee - credits
    const balance = invoiceTotal - totalPaid

    return {
      basePrice,
      adminFee,
      credits,
      depositTotal,
      otherPaymentTotal,
      extraCreditTotal,
      refundTotal,
      totalPaid,
      invoiceTotal,
      balance,
    }
  }, [detail])

  const puppiesAdopted = detail?.puppies?.length ?? 0

  /* ---------- actions ---------- */

  async function handleCreateBuyer(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    setSavingBuyer(true)
    setListError(null)
    try {
      const payload = {
        full_name: newName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
        source: newSource || null,
        on_payment_plan: newOnPlan || null,
      }

      const { data, error } = await sb
        .from('puppy_buyers')
        .insert(payload)
        .select(
          'id, full_name, email, phone, city, state, base_price, credits, admin_fee_financing, source, on_payment_plan, plan_start_date, plan_due_day, plan_status, plan_min_payment, created_at'
        )
        .single()
      if (error) throw error
      const row = data as BuyerRow
      setBuyers((prev) => [row, ...prev])
      setSelectedId(row.id)
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      setNewSource('')
      setNewOnPlan(false)
    } catch (e: any) {
      setListError(e?.message || 'Failed to create buyer.')
    } finally {
      setSavingBuyer(false)
    }
  }

  async function handleSaveBuyer() {
    if (!detail || !editBuyer) return
    setSavingEdit(true)
    setDetailError(null)
    try {
      const payload = {
        full_name: editBuyer.full_name.trim(),
        email: editBuyer.email?.trim() || null,
        phone: editBuyer.phone?.trim() || null,
        city: editBuyer.city?.trim() || null,
        state: editBuyer.state?.trim() || null,
        address_line1: editBuyer.address_line1?.trim() || null,
        postal_code: editBuyer.postal_code?.trim() || null,
        notes: editBuyer.notes?.trim() || null,
        source: editBuyer.source || null,
      }

      const { error } = await sb
        .from('puppy_buyers')
        .update(payload)
        .eq('id', detail.buyer.id)
      if (error) throw error

      // sync list + detail
      setBuyers((prev) =>
        prev.map((b) =>
          b.id === detail.buyer.id
            ? {
                ...b,
                full_name: payload.full_name,
                email: payload.email,
                phone: payload.phone,
                city: payload.city,
                state: payload.state,
                source: payload.source,
              }
            : b
        )
      )
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              buyer: { ...prev.buyer, ...payload },
            }
          : prev
      )
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to save buyer.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleSaveFinancials() {
    if (!detail) return
    setSavingFinancials(true)
    setDetailError(null)
    try {
      const base_price = safeNum(priceEdit)
      const credits = safeNum(creditsEdit)
      const admin_fee_financing = safeNum(adminFeeEdit)

      const { error } = await sb
        .from('puppy_buyers')
        .update({
          base_price,
          credits,
          admin_fee_financing,
        })
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

      setBuyers((prev) =>
        prev.map((b) =>
          b.id === detail.buyer.id
            ? {
                ...b,
                base_price,
                credits,
                admin_fee_financing,
              }
            : b
        )
      )
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to save financials.')
    } finally {
      setSavingFinancials(false)
    }
  }

  async function handleSavePlan() {
    if (!detail) return
    setSavingPlan(true)
    setDetailError(null)
    try {
      const plan_start_date = planStart || null
      const plan_due_day = safeNum(planDueDay)
      const plan_min_payment = safeNum(planMinPayment)
      const on_payment_plan = planOn
      const plan_status = planStatus || null

      const { error } = await sb
        .from('puppy_buyers')
        .update({
          on_payment_plan,
          plan_start_date,
          plan_due_day,
          plan_min_payment,
          plan_status,
        })
        .eq('id', detail.buyer.id)
      if (error) throw error

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              buyer: {
                ...prev.buyer,
                on_payment_plan,
                plan_start_date,
                plan_due_day,
                plan_min_payment,
                plan_status,
              },
            }
          : prev
      )

      setBuyers((prev) =>
        prev.map((b) =>
          b.id === detail.buyer.id
            ? {
                ...b,
                on_payment_plan,
                plan_start_date,
                plan_due_day,
                plan_min_payment,
                plan_status,
              }
            : b
        )
      )
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to save payment plan.')
    } finally {
      setSavingPlan(false)
    }
  }

  async function handleAddPayment() {
    if (!detail || !payAmount.trim()) return
    setSavingPayment(true)
    setDetailError(null)
    try {
      const amount = Number(payAmount)
      if (!Number.isFinite(amount)) throw new Error('Invalid amount')

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

      const row = data as PaymentRecord
      setDetail((prev) =>
        prev
          ? { ...prev, payments: [row, ...prev.payments] }
          : prev
      )

      setPayAmount('')
      setPayDate('')
      setPayMethod('')
      setPayNotes('')
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to add payment.')
    } finally {
      setSavingPayment(false)
    }
  }

  async function handleDeleteBuyer() {
    if (!detail) return
    if (
      !window.confirm(
        'Delete this buyer? This will remove the buyer record; puppies and payments will stay in the database but remain linked by buyer_id.'
      )
    ) {
      return
    }
    setDeleting(true)
    setDetailError(null)
    try {
      const { error } = await sb
        .from('puppy_buyers')
        .delete()
        .eq('id', detail.buyer.id)
      if (error) throw error
      setBuyers((prev) => prev.filter((b) => b.id !== detail.buyer.id))
      setSelectedId(null)
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to delete buyer.')
    } finally {
      setDeleting(false)
    }
  }

  /* ---------- render ---------- */

  return (
    <main className="buyers-shell">
      {/* LEFT: search + new buyer + list */}
      <section className="buyers-left" style={panelStyle}>
        <header className="buyers-left-header">
          <h1>Buyers</h1>
          <p>
            Search and manage every family that has adopted (or is adopting)
            from Southwest Virginia Chihuahua.
          </p>
        </header>

        {/* Search area spanning left panel */}
        <section className="buyers-search">
          <input
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <div className="buyers-search-actions">
            <button
              type="button"
              style={primaryBtn}
              onClick={() => loadBuyers(search)}
            >
              Search
            </button>
            <button
              type="button"
              className="clearBtn"
              onClick={() => {
                setSearch('')
                loadBuyers('')
              }}
            >
              Clear
            </button>
          </div>
        </section>

        {/* Add buyer */}
        <section className="buyers-add">
          <div className="sectionLabel">Add Buyer</div>
          <form onSubmit={handleCreateBuyer} className="buyers-add-form">
            <input
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              placeholder="Email (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={inputStyle}
              type="email"
            />
            <input
              placeholder="Phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={inputStyle}
            />

            <div className="fieldRow">
              <div className="labelSm">Source</div>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select source…</option>
                <option value="good_dog">GoodDog</option>
                <option value="website">Website</option>
                <option value="facebook">Facebook</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>

            <label className="checkboxRow">
              <input
                type="checkbox"
                checked={newOnPlan}
                onChange={(e) => setNewOnPlan(e.target.checked)}
              />
              <span>Puppy Payments (financing plan)</span>
            </label>

            <button
              type="submit"
              style={primaryBtn}
              disabled={savingBuyer}
            >
              {savingBuyer ? 'Saving…' : 'Save Buyer'}
            </button>
          </form>
        </section>

        {/* Buyers list */}
        <section className="buyers-list">
          <div className="sectionLabel">
            Buyers {loadingList && <span>(Loading…)</span>}
          </div>
          {listError && (
            <div className="errorBox">{listError}</div>
          )}
          {buyers.length === 0 && !loadingList && (
            <div className="emptyMsg">No buyers yet.</div>
          )}
          <div className="buyers-scroll">
            {buyers.map((b) => (
              <button
                key={b.id}
                type="button"
                className={
                  'buyers-item' +
                  (selectedId === b.id ? ' buyers-item-active' : '')
                }
                onClick={() => setSelectedId(b.id)}
              >
                <div className="buyers-item-top">
                  <div className="buyers-item-name">{b.full_name}</div>
                  {b.on_payment_plan && (
                    <span className="badge-plan">Puppy Payments</span>
                  )}
                </div>
                <div className="buyers-item-sub">
                  {b.email || 'No email'} ·{' '}
                  {b.city && b.state
                    ? `${b.city}, ${b.state}`
                    : b.city || b.state || 'Location unknown'}
                </div>
                <div className="buyers-item-sub">
                  Source:{' '}
                  {b.source
                    ? sourceLabel(b.source)
                    : '—'}
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>

      {/* RIGHT: detail */}
      <section className="buyers-right">
        <div className="buyers-right-inner" style={panelStyle}>
          {detailLoading && !detail && (
            <div className="emptyMsg">Loading buyer…</div>
          )}
          {!detailLoading && !detail && (
            <div className="emptyMsg">
              Select a buyer on the left (or add a new one) to view
              contact info, payment plan, and adopted puppies.
            </div>
          )}

          {detail && (
            <>
              {/* Header with puppies adopted + actions */}
              <header className="detail-header">
                <div>
                  <div className="detail-name">
                    {detail.buyer.full_name}
                  </div>
                  <div className="detail-sub">
                    Buyer since {fmtDate(detail.buyer.created_at)} · Source:{' '}
                    {detail.buyer.source
                      ? sourceLabel(detail.buyer.source)
                      : '—'}
                  </div>
                </div>
                <div className="detail-header-right">
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() =>
                      router.push(
                        `/admin/puppies?buyer=${detail.buyer.id}`
                      )
                    }
                  >
                    Puppies adopted:{' '}
                    <strong>{puppiesAdopted}</strong>
                  </button>
                  <button
                    type="button"
                    style={dangerBtn}
                    onClick={handleDeleteBuyer}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete Buyer'}
                  </button>
                </div>
              </header>

              {detailError && (
                <div className="errorBox">{detailError}</div>
              )}

              {/* FINANCIAL SUMMARY */}
              <section className="detail-section">
                <h2>Financial Summary</h2>
                <div className="pillRow">
                  <SummaryPill
                    label="Base Price"
                    value={fmtCurrency(financials.basePrice)}
                  />
                  <SummaryPill
                    label="Admin Fee Financing"
                    value={fmtCurrency(financials.adminFee)}
                  />
                  <SummaryPill
                    label="Buyer Credits"
                    value={fmtCurrency(financials.credits)}
                  />
                  <SummaryPill
                    label="Deposits"
                    value={fmtCurrency(financials.depositTotal)}
                  />
                  <SummaryPill
                    label="Other Payments"
                    value={fmtCurrency(
                      financials.otherPaymentTotal
                    )}
                  />
                  <SummaryPill
                    label="Extra Credits (payments)"
                    value={fmtCurrency(
                      financials.extraCreditTotal
                    )}
                  />
                  <SummaryPill
                    label="Refunds"
                    value={fmtCurrency(financials.refundTotal)}
                  />
                  <SummaryPill
                    label="Total Paid"
                    value={fmtCurrency(financials.totalPaid)}
                  />
                  <SummaryPill
                    label="Balance"
                    value={fmtCurrency(financials.balance)}
                    accent={
                      financials.balance > 0
                        ? '#b91c1c'
                        : '#15803d'
                    }
                  />
                </div>

                <div className="financial-edit">
                  <div className="financial-grid">
                    <div>
                      <div className="labelSm">Base Price</div>
                      <input
                        type="number"
                        value={priceEdit}
                        onChange={(e) =>
                          setPriceEdit(e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <div className="labelSm">Buyer Credits</div>
                      <input
                        type="number"
                        value={creditsEdit}
                        onChange={(e) =>
                          setCreditsEdit(e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <div className="labelSm">
                        Admin Fee Financing
                      </div>
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
                    style={primaryBtn}
                    onClick={handleSaveFinancials}
                    disabled={savingFinancials}
                  >
                    {savingFinancials ? 'Saving…' : 'Save Amounts'}
                  </button>
                </div>
              </section>

              {/* PAYMENT PLAN SUMMARY */}
              <section className="detail-section">
                <div className="section-header-row">
                  <h2>Puppy Payments Plan</h2>
                  <label className="checkboxRow">
                    <input
                      type="checkbox"
                      checked={planOn}
                      onChange={(e) =>
                        setPlanOn(e.target.checked)
                      }
                    />
                    <span>Buyer is on a Puppy Payments plan</span>
                  </label>
                </div>

                {planOn ? (
                  <>
                    <div className="pillRow">
                      <SummaryPill
                        label="Plan Start"
                        value={fmtDate(planStart || null)}
                      />
                      <SummaryPill
                        label="Due Day"
                        value={
                          planDueDay
                            ? `Day ${planDueDay} each month`
                            : '—'
                        }
                      />
                      <SummaryPill
                        label="Min Payment"
                        value={fmtCurrency(
                          safeNum(planMinPayment) ?? 0
                        )}
                      />
                      <SummaryPill
                        label="Amount Paid"
                        value={fmtCurrency(
                          financials.totalPaid
                        )}
                      />
                      <SummaryPill
                        label="Remaining Balance"
                        value={fmtCurrency(
                          financials.balance
                        )}
                        accent={
                          financials.balance > 0
                            ? '#b91c1c'
                            : '#15803d'
                        }
                      />
                      <SummaryPill
                        label="Status"
                        value={
                          planStatus
                            ? planStatusLabel(planStatus)
                            : 'Current'
                        }
                      />
                    </div>

                    <div className="financial-edit">
                      <div className="financial-grid">
                        <div>
                          <div className="labelSm">
                            Plan Start Date
                          </div>
                          <input
                            type="date"
                            value={planStart}
                            onChange={(e) =>
                              setPlanStart(e.target.value)
                            }
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div className="labelSm">
                            Due Day of Month (1–31)
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={planDueDay}
                            onChange={(e) =>
                              setPlanDueDay(e.target.value)
                            }
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div className="labelSm">
                            Minimum Payment
                          </div>
                          <input
                            type="number"
                            value={planMinPayment}
                            onChange={(e) =>
                              setPlanMinPayment(e.target.value)
                            }
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div className="labelSm">
                            Plan Status
                          </div>
                          <select
                            value={planStatus}
                            onChange={(e) =>
                              setPlanStatus(e.target.value)
                            }
                            style={selectStyle}
                          >
                            <option value="">
                              Choose status…
                            </option>
                            <option value="current">
                              Current
                            </option>
                            <option value="past_due">
                              Past Due
                            </option>
                            <option value="write_off">
                              Write-Off
                            </option>
                            <option value="collections">
                              Collections
                            </option>
                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={primaryBtn}
                        onClick={handleSavePlan}
                        disabled={savingPlan}
                      >
                        {savingPlan
                          ? 'Saving plan…'
                          : 'Save Plan Details'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="emptyMsg">
                    This buyer is not currently marked as being on a
                    Puppy Payments plan.
                  </div>
                )}
              </section>

              {/* CONTACT INFO */}
              <section className="detail-section">
                <h2>Contact Information</h2>
                {editBuyer && (
                  <div className="contact-grid">
                    <Field
                      label="Full Name"
                      value={editBuyer.full_name}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          full_name: v,
                        })
                      }
                    />
                    <Field
                      label="Email"
                      value={editBuyer.email || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          email: v || null,
                        })
                      }
                    />
                    <Field
                      label="Phone"
                      value={editBuyer.phone || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          phone: v || null,
                        })
                      }
                    />
                    <Field
                      label="Address line 1"
                      value={editBuyer.address_line1 || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          address_line1: v || null,
                        })
                      }
                    />
                    <Field
                      label="City"
                      value={editBuyer.city || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          city: v || null,
                        })
                      }
                    />
                    <Field
                      label="State"
                      value={editBuyer.state || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          state: v || null,
                        })
                      }
                    />
                    <Field
                      label="Postal Code"
                      value={editBuyer.postal_code || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          postal_code: v || null,
                        })
                      }
                    />
                    <Field
                      label="Notes"
                      value={editBuyer.notes || ''}
                      onChange={(v) =>
                        setEditBuyer({
                          ...editBuyer,
                          notes: v || null,
                        })
                      }
                    />
                  </div>
                )}
                <button
                  type="button"
                  style={primaryBtn}
                  onClick={handleSaveBuyer}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving…' : 'Save Contact Info'}
                </button>
              </section>

              {/* PUPPIES & PUPPY DETAIL */}
              <section className="detail-section">
                <div className="section-header-row">
                  <h2>Puppies</h2>
                  <span className="section-sub">
                    Click a puppy name to see the full record on the
                    right. From the Puppies admin view, you can tie
                    them into litters and dams.
                  </span>
                </div>
                {detail.puppies.length === 0 && (
                  <div className="emptyMsg">
                    No puppies assigned to this buyer.
                  </div>
                )}
                {detail.puppies.length > 0 && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Admin Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.puppies.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <button
                              type="button"
                              className={
                                'linkBtn' +
                                (puppyFocusId === p.id
                                  ? ' linkBtn-active'
                                  : '')
                              }
                              onClick={() =>
                                setPuppyFocusId(
                                  puppyFocusId === p.id
                                    ? null
                                    : p.id
                                )
                              }
                            >
                              {p.name || 'Unnamed puppy'}
                            </button>
                          </td>
                          <td>{p.status || '—'}</td>
                          <td>{fmtCurrency(p.price)}</td>
                          <td>
                            <button
                              type="button"
                              className="miniLink"
                              onClick={() =>
                                router.push(
                                  `/admin/puppies?focus=${p.id}`
                                )
                              }
                            >
                              View Puppy
                            </button>
                            <button
                              type="button"
                              className="miniLink"
                              onClick={() =>
                                router.push(
                                  `/admin/litters?puppy=${p.id}`
                                )
                              }
                            >
                              View Litter
                            </button>
                            <button
                              type="button"
                              className="miniLink"
                              onClick={() =>
                                router.push(
                                  `/admin/breeding-program?puppy=${p.id}`
                                )
                              }
                            >
                              View Dam
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* PAYMENTS + DEPOSITS */}
              <section className="detail-section">
                <div className="two-col">
                  {/* deposits */}
                  <div className="col">
                    <h2>Deposits</h2>
                    {detail.payments.filter(
                      (p) => p.type === 'deposit'
                    ).length === 0 && (
                      <div className="emptyMsg">
                        No deposits recorded.
                      </div>
                    )}
                    {detail.payments.filter(
                      (p) => p.type === 'deposit'
                    ).length > 0 && (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.payments
                            .filter((p) => p.type === 'deposit')
                            .map((p) => (
                              <tr key={p.id}>
                                <td>{fmtDate(p.payment_date)}</td>
                                <td>{fmtCurrency(p.amount)}</td>
                                <td>{p.method || '—'}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* add payment */}
                  <div className="col">
                    <h2>Add Payment / Credit / Refund</h2>
                    <div className="fieldRow">
                      <div className="labelSm">Type</div>
                      <select
                        value={payType}
                        onChange={(e) =>
                          setPayType(e.target.value)
                        }
                        style={selectStyle}
                      >
                        <option value="deposit">Deposit</option>
                        <option value="payment">Payment</option>
                        <option value="credit">Credit</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                    <div className="fieldRow">
                      <div className="labelSm">Amount</div>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) =>
                          setPayAmount(e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div className="fieldRow">
                      <div className="labelSm">Date</div>
                      <input
                        type="date"
                        value={payDate}
                        onChange={(e) =>
                          setPayDate(e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div className="fieldRow">
                      <div className="labelSm">
                        Method / Notes
                      </div>
                      <input
                        value={payMethod}
                        onChange={(e) =>
                          setPayMethod(e.target.value)
                        }
                        style={inputStyle}
                        placeholder="Cash, PayPal, etc."
                      />
                    </div>
                    <div className="fieldRow">
                      <div className="labelSm">
                        Internal notes
                      </div>
                      <input
                        value={payNotes}
                        onChange={(e) =>
                          setPayNotes(e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <button
                      type="button"
                      style={primaryBtn}
                      onClick={handleAddPayment}
                      disabled={savingPayment}
                    >
                      {savingPayment ? 'Saving…' : 'Add Payment'}
                    </button>
                  </div>
                </div>

                {/* all payments */}
                <div className="mt16">
                  <h2>All Payments</h2>
                  {detail.payments.length === 0 && (
                    <div className="emptyMsg">
                      No payments recorded for this buyer.
                    </div>
                  )}
                  {detail.payments.length > 0 && (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.payments.map((p) => (
                          <tr key={p.id}>
                            <td>{fmtDate(p.payment_date)}</td>
                            <td>{p.type || '—'}</td>
                            <td>{fmtCurrency(p.amount)}</td>
                            <td>{p.method || '—'}</td>
                            <td>{p.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* RIGHT EDGE: puppy detail panel */}
        {puppyFocusId && (
          <aside className="puppy-detail" style={panelStyle}>
            <div className="puppy-detail-header">
              <div className="puppy-detail-title">
                Puppy Record
              </div>
              <button
                type="button"
                className="clearBtn"
                onClick={() => setPuppyFocusId(null)}
              >
                Close
              </button>
            </div>
            {puppyLoading && (
              <div className="emptyMsg">Loading puppy…</div>
            )}
            {!puppyLoading && !puppyDetail && (
              <div className="emptyMsg">
                Could not load this puppy record.
              </div>
            )}
            {!puppyLoading && puppyDetail && (
              <div className="puppy-detail-body">
                {Object.entries(puppyDetail).map(
                  ([k, v]) => (
                    <div key={k} className="puppy-field">
                      <div className="labelSm">
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div className="puppy-field-value">
                        {String(v ?? '—')}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </aside>
        )}
      </section>

      <style jsx>{`
        .buyers-shell {
          min-height: 100vh;
          padding: 18px 20px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 18px;
          background: linear-gradient(
            180deg,
            #f9fafb,
            #fefce8
          ); /* light neutral + soft yellow */
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            'Segoe UI', sans-serif;
          color: #111827;
        }

        .buyers-left {
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .buyers-left-header h1 {
          margin: 0 0 4px;
          font-size: 20px;
        }
        .buyers-left-header p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }

        .buyers-search {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .buyers-search-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 2px;
        }

        .clearBtn {
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          padding: 5px 11px;
          font-size: 12px;
          background: #f9fafb;
          color: #374151;
          cursor: pointer;
          width: fit-content;
        }

        .buyers-add {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
        }

        .sectionLabel {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .buyers-add-form {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .checkboxRow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #374151;
        }

        .checkboxRow input {
          margin: 0;
        }

        .buyers-list {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-height: 0;
        }

        .buyers-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 4px;
        }

        .buyers-item {
          width: 100%;
          text-align: left;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 7px 9px;
          margin-bottom: 6px;
          background: #f9fafb;
          cursor: pointer;
          font-size: 13px;
        }

        .buyers-item-active {
          border-color: #f97316;
          box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
          background: #fff7ed;
        }

        .buyers-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .buyers-item-name {
          font-weight: 600;
        }

        .buyers-item-sub {
          font-size: 11px;
          color: #6b7280;
        }

        .badge-plan {
          font-size: 10px;
          border-radius: 999px;
          padding: 2px 6px;
          background: #f97316;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .buyers-right {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 14px;
          align-items: flex-start;
        }

        .buyers-right-inner {
          padding: 16px 16px 18px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .detail-header-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .detail-name {
          font-size: 18px;
          font-weight: 600;
        }

        .detail-sub {
          font-size: 11px;
          color: #6b7280;
        }

        .pill-link {
          border-radius: 999px;
          border: 1px solid #fed7aa;
          padding: 6px 10px;
          font-size: 12px;
          background: #fff7ed;
          color: #9a3412;
          cursor: pointer;
        }

        .errorBox {
          margin-bottom: 8px;
          padding: 8px 9px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
        }

        .emptyMsg {
          font-size: 13px;
          color: #6b7280;
          padding: 10px 0;
        }

        .detail-section {
          margin-top: 14px;
        }

        .detail-section h2 {
          margin: 0 0 6px;
          font-size: 15px;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .section-sub {
          font-size: 11px;
          color: #6b7280;
        }

        .pillRow {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(160px, 1fr)
          );
          gap: 8px;
        }

        .financial-edit {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .financial-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(160px, 1fr)
          );
          gap: 6px;
        }

        .labelSm {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(180px, 1fr)
          );
          gap: 6px 10px;
          margin-bottom: 8px;
        }

        .fieldRow {
          margin-bottom: 6px;
        }

        .two-col {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 10px;
          margin-top: 4px;
        }

        .col h2 {
          margin: 0 0 6px;
        }

        .mt16 {
          margin-top: 14px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .table th,
        .table td {
          padding: 6px 6px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        .table th {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
        }

        .linkBtn {
          border: none;
          padding: 0;
          margin: 0;
          font-size: 13px;
          color: #2563eb;
          background: none;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .linkBtn-active {
          color: #c2410c;
        }

        .miniLink {
          border: none;
          background: none;
          padding: 0;
          margin-right: 6px;
          font-size: 11px;
          color: #2563eb;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .puppy-detail {
          padding: 14px 12px 14px;
          align-self: stretch;
          position: sticky;
          top: 18px;
        }

        .puppy-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .puppy-detail-title {
          font-size: 14px;
          font-weight: 600;
        }

        .puppy-detail-body {
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding-right: 4px;
        }

        .puppy-field {
          margin-bottom: 6px;
        }

        .puppy-field-value {
          font-size: 12px;
        }

        @media (max-width: 1040px) {
          .buyers-shell {
            grid-template-columns: 1fr;
          }
          .buyers-right {
            grid-template-columns: minmax(0, 1fr);
          }
          .puppy-detail {
            position: static;
            margin-top: 10px;
          }
        }
      `}</style>
    </main>
  )
}

/* ---------- small components & helpers ---------- */

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
        border: '1px solid #e5e7eb',
        padding: '7px 10px',
        background: '#f9fafb',
      }}
    >
      <div style={pillLabel}>{label}</div>
      <div
        style={{
          ...pillValue,
          color: accent || '#111827',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="labelSm">{label}</div>
      <input
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function sourceLabel(code: string | null): string {
  if (!code) return '—'
  if (code === 'good_dog') return 'GoodDog'
  if (code === 'website') return 'Website'
  if (code === 'facebook') return 'Facebook'
  if (code === 'referral') return 'Referral'
  if (code === 'other') return 'Other'
  return code
}

function planStatusLabel(code: string | null): string {
  if (!code) return 'Current'
  if (code === 'current') return 'Current'
  if (code === 'past_due') return 'Past Due'
  if (code === 'write_off') return 'Write-Off'
  if (code === 'collections') return 'Collections'
  if (code === 'completed') return 'Completed'
  return code
}
