'use client'

/* ============================================
   Transportation Page – Puppy Portal
   - Left sidebar nav (same style as home)
   - Calendar (one request per day, greyed if booked)
   - Transportation request form
   - Accordion policies (click to expand)
   ============================================ */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ============================================
   ANCHOR: SUPABASE CLIENT (BROWSER)
   ============================================ */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let supabaseBrowser: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  if (!supabaseBrowser) {
    supabaseBrowser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseBrowser
}

/* ============================================
   ANCHOR: THEME + ICONS
   ============================================ */

const THEME = {
  bg: '#020617',
  sidebar: '#020617',
  panelBorder: '#111827',
  ink: '#f9fafb',
  muted: '#9ca3af',
  brand: '#e0a96d',
  brandAlt: '#c47a35',
}

const IconPuppy = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width={18} height={18} fill="currentColor" {...p}>
    <path d="M20 16c-5 0-9 4-9 9 0 6 3 9 3 12 0 3 2 5 5 5h1c2 5 6 8 12 8s10-3 12-8h1c3 0 5-2 5-5 0-3 3-6 3-12 0-5-4-9-9-9-4 0-7 2-9 5-2-3-5-5-9-5zM26 32a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM24 41c4 3 12 3 16 0 1-1 3 0 2 2-2 4-18 4-20 0-1-2 1-3 2-2z" />
  </svg>
)

const IconPaw = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width={18}
    height={18}
    aria-hidden
    fill="currentColor"
    {...props}
  >
    <path d="M12 13c-2.6 0-5 1.9-5 4.2C7 19.4 8.6 21 10.7 21h2.6C15.4 21 17 19.4 17 17.2 17 14.9 14.6 13 12 13zm-5.4-2.1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10.8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.5 9.7c1.3 0 2.3-1.2 2.3-2.7S10.8 4.3 9.5 4.3 7.2 5.5 7.2 7s1 2.7 2.3 2.7zm5 0c1.3 0 2.3-1.2 2.3-2.7s-1-2.7-2.3-2.7-2.3 1.2-2.3 2.7 1 2.7 2.3 2.7z" />
  </svg>
)

const IconDoc = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1v4h4" />
  </svg>
)
const IconCard = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7zm0 4h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6zm3 5h4v2H6v-2z" />
  </svg>
)
const IconTruck = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M3 7h11v7h2.5l2.2-3H21v6h-1a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H3V7zm14 8a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2zM6 17a2 2 0 0 1 2 2H4a2 2 0 0 1 2-2z" />
  </svg>
)
const IconChat = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z" />
  </svg>
)
const IconUser = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
  </svg>
)

/* ============================================
   ANCHOR: NAV TABS
   ============================================ */

const BASE = ''

const tabs = [
  { key: 'available', label: 'Available Puppies', href: `${BASE}/available-puppies`, Icon: IconPuppy },
  { key: 'mypuppy', label: 'My Puppy', href: `${BASE}/my-puppy`, Icon: IconPaw },
  { key: 'docs', label: 'Documents', href: `${BASE}/documents`, Icon: IconDoc },
  { key: 'payments', label: 'Payments', href: `${BASE}/payments`, Icon: IconCard },
  { key: 'transport', label: 'Transportation', href: `${BASE}/transportation`, Icon: IconTruck },
  { key: 'message', label: 'Message', href: `${BASE}/messages`, Icon: IconChat },
  { key: 'profile', label: 'Profile', href: `${BASE}/profile`, Icon: IconUser },
] as const

type TabKey = (typeof tabs)[number]['key'] | 'home'

function activeKeyFromPathname(pathname?: string | null): TabKey {
  if (!pathname || pathname === '/' || pathname === BASE || pathname === `${BASE}/`) {
    return 'home'
  }
  const t = tabs.find((t) => pathname.startsWith(t.href))
  return (t?.key as TabKey) ?? 'home'
}

/* ============================================
   ANCHOR: CALENDAR HELPERS
   ============================================ */

type CalendarDay = {
  date: Date
  key: string
  label: number
  isCurrentMonth: boolean
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const firstDay = firstOfMonth.getDay() // 0 (Sun) - 6 (Sat)

  const days: CalendarDay[] = []

  // 6 weeks * 7 days = 42 cells
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 + (i - firstDay))
    const isCurrentMonth = date.getMonth() === month
    days.push({
      date,
      key: formatDateKey(date),
      label: date.getDate(),
      isCurrentMonth,
    })
  }

  return days
}

/* ============================================
   ANCHOR: FORM STATE
   ============================================ */

type TransportOption =
  | 'pick_up'
  | 'breeder_delivery'
  | 'pro_transporter'
  | 'flight_nanny'
  | 'other'

type TransportFormState = {
  option: TransportOption
  otherOption: string
  street: string
  street2: string
  city: string
  stateRegion: string
  postal: string
  country: string
  backupFirst: string
  backupLast: string
  backupPhone: string
  notes: string
  agreeHealth: boolean
  agreeFees: boolean
  acceptTerms: boolean
}

const initialForm: TransportFormState = {
  option: 'pick_up',
  otherOption: '',
  street: '',
  street2: '',
  city: '',
  stateRegion: '',
  postal: '',
  country: 'United States',
  backupFirst: '',
  backupLast: '',
  backupPhone: '',
  notes: '',
  agreeHealth: false,
  agreeFees: false,
  acceptTerms: false,
}

/* ============================================
   PAGE COMPONENT
   ============================================ */

type StatusMsg = { kind: 'success' | 'error'; text: string } | null
type InfoSectionKey = 'mileage' | 'terms' | 'health' | 'fees' | 'hypo'

export default function TransportationPage() {
  const pathname = usePathname()
  const activeKey = useMemo(() => activeKeyFromPathname(pathname), [pathname])

  const [monthDate, setMonthDate] = useState<Date>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [bookedDates, setBookedDates] = useState<Set<string>>(() => new Set())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [form, setForm] = useState<TransportFormState>({ ...initialForm })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<StatusMsg>(null)
  const [openSection, setOpenSection] = useState<InfoSectionKey | null>('mileage')

  const hasEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate])

  useEffect(() => {
    if (!hasEnv) return
    ;(async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('transport_requests')
          .select('trip_date')
        if (error) throw error

        const next = new Set<string>()
        for (const row of data ?? []) {
          const raw = (row as any).trip_date as string | null
          if (raw) next.add(raw.slice(0, 10))
        }
        setBookedDates(next)
      } catch (err) {
        console.error('Failed to load booked dates', err)
      }
    })()
  }, [hasEnv])

  function updateForm<K extends keyof TransportFormState>(
    key: K,
    value: TransportFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function changeMonth(delta: number) {
    setMonthDate((prev) => {
      const y = prev.getFullYear()
      const m = prev.getMonth() + delta
      return new Date(y, m, 1)
    })
  }

  function toggleSection(section: InfoSectionKey) {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (!hasEnv) {
      setStatus({
        kind: 'error',
        text: 'Transportation requests are not yet configured. Please contact the breeder directly.',
      })
      return
    }

    if (!selectedDate) {
      setStatus({
        kind: 'error',
        text: 'Please choose an available date on the calendar.',
      })
      return
    }

    if (bookedDates.has(selectedDate)) {
      setStatus({
        kind: 'error',
        text: 'That date is already reserved. Please pick another day.',
      })
      return
    }

    if (!form.agreeHealth || !form.agreeFees || !form.acceptTerms) {
      setStatus({
        kind: 'error',
        text: 'Please confirm the Health & Safety, Fees, and Terms checkboxes before submitting.',
      })
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('transport_requests').insert({
        trip_date: selectedDate,
        option: form.option,
        other_option: form.otherOption || null,
        street: form.street,
        street2: form.street2 || null,
        city: form.city,
        state_region: form.stateRegion,
        postal: form.postal,
        country: form.country,
        backup_first: form.backupFirst,
        backup_last: form.backupLast,
        backup_phone: form.backupPhone,
        notes: form.notes || null,
      })

      if (error) throw error

      setBookedDates((prev) => {
        const next = new Set(prev)
        next.add(selectedDate)
        return next
      })
      setSelectedDate('')
      setForm({ ...initialForm })
      setStatus({
        kind: 'success',
        text: 'Transportation request submitted. We will review your request and confirm the details with you.',
      })
    } catch (err: any) {
      console.error(err)
      setStatus({
        kind: 'error',
        text: err?.message || 'Unable to submit your request right now.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const monthLabel = monthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main>
      <div className="shell">
        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar">
          <div className="brand">
            <div className="pupmark" aria-hidden>
              <span className="pawbubble" />
              <span className="pawbubble" />
              <span className="pawbubble" />
            </div>
            <div className="brandText">
              <div className="brandLine1">My Puppy Portal</div>
              <div className="brandLine2">Virginia&apos;s Premier Chihuahua Breeder</div>
            </div>
          </div>

          <nav className="nav">
            {tabs.map(({ key, label, href, Icon }) => (
              <Link
                key={key}
                href={href}
                className={`navItem ${activeKey === key ? 'active' : ''}`}
              >
                <span className="navIcon">
                  <Icon />
                </span>
                <span className="navLabel">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <section className="main">
          <section className="hero">
            <h1>Schedule Your Puppy&apos;s Transportation</h1>
            <p>
              Use this page to schedule your transportation request. Choose an available
              date, select your transportation option, and share your preferred meeting
              details so we can plan a safe, low-stress trip for your Chihuahua.
            </p>
          </section>

          <section className="transportContent">
            {/* LEFT: POLICIES / ACCORDION */}
            <div className="transportLeft">
              <div className="panel">
                <h2>Transportation Policies &amp; Info</h2>
                <p className="muted">
                  Click a heading below to reveal the full policy. These sections are what
                  you&apos;re agreeing to when you submit a transportation request.
                </p>

                <div className="accordion">
                  {/* Puppy Mileage Fee Policy */}
                  <div className="accItem">
                    <button
                      type="button"
                      className={`accHeader ${openSection === 'mileage' ? 'open' : ''}`}
                      onClick={() => toggleSection('mileage')}
                    >
                      <span>Puppy Mileage Fee Policy</span>
                      <span className="chevron">▾</span>
                    </button>
                    <div
                      className={`accBody ${openSection === 'mileage' ? 'open' : ''}`}
                    >
                      <p>
                        We are happy to personally deliver our puppies to ensure safe,
                        stress-free travel. To make adoption easier for local families, we
                        include a limited number of free miles before mileage fees begin.
                      </p>
                      <h4>Included Free Miles</h4>
                      <ul>
                        <li>The first 50 miles (one way) from Marion, VA are free.</li>
                        <li>
                          After 50 miles, delivery is charged at{' '}
                          <strong>$1.25 per mile</strong> (one way).
                        </li>
                        <li>
                          Mileage is calculated using the most direct driving route from
                          Marion, VA (via Google Maps).
                        </li>
                        <li>
                          A minimum delivery fee of <strong>$75</strong> applies for all
                          trips beyond the free-mile zone.
                        </li>
                      </ul>
                      <h4>Delivery Range</h4>
                      <ul>
                        <li>Local deliveries are available within a 300-mile radius.</li>
                        <li>
                          Longer distances may be arranged at breeder discretion and may
                          require overnight accommodations or a USDA-licensed transporter.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Transportation Terms & Conditions */}
                  <div className="accItem">
                    <button
                      type="button"
                      className={`accHeader ${openSection === 'terms' ? 'open' : ''}`}
                      onClick={() => toggleSection('terms')}
                    >
                      <span>Transportation Terms &amp; Conditions</span>
                      <span className="chevron">▾</span>
                    </button>
                    <div className={`accBody ${openSection === 'terms' ? 'open' : ''}`}>
                      <p>
                        These terms outline how transportation is handled and who is
                        responsible for each part of the journey.
                      </p>
                      <h4>Payment Requirement</h4>
                      <ul>
                        <li>
                          All transportation costs must be paid in full before the puppy
                          leaves the breeder&apos;s possession.
                        </li>
                        <li>
                          Puppies must be fully paid for before transport arrangements are
                          finalized.
                        </li>
                      </ul>
                      <h4>Transportation Options</h4>
                      <ul>
                        <li>Pick-up in person.</li>
                        <li>Breeder delivery by ground transport.</li>
                        <li>Licensed ground transport service.</li>
                        <li>Flight nanny (in-cabin) service.</li>
                      </ul>
                      <h4>Missed Pickup / Delivery</h4>
                      <ul>
                        <li>
                          If the buyer or buyer&apos;s representative fails to appear at
                          the agreed pickup/delivery time, additional fees may apply for
                          rescheduling or boarding.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Health & Safety Agreement */}
                  <div className="accItem">
                    <button
                      type="button"
                      className={`accHeader ${openSection === 'health' ? 'open' : ''}`}
                      onClick={() => toggleSection('health')}
                    >
                      <span>Health &amp; Safety Agreement</span>
                      <span className="chevron">▾</span>
                    </button>
                    <div
                      className={`accBody ${openSection === 'health' ? 'open' : ''}`}
                    >
                      <p>
                        We want every puppy to arrive bright, stable, and healthy. Travel
                        can be exciting but also tiring for small Chihuahuas, so we ask
                        buyers to follow these guidelines.
                      </p>
                      <ul>
                        <li>
                          Buyer understands that all transportation methods carry some
                          level of stress and risk for the puppy.
                        </li>
                        <li>
                          Buyer will provide a warm, draft-free environment and offer
                          small frequent meals after arrival.
                        </li>
                        <li>
                          Buyer agrees to schedule a veterinary wellness exam within 72
                          hours of receiving the puppy.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Fees & Liabilities */}
                  <div className="accItem">
                    <button
                      type="button"
                      className={`accHeader ${openSection === 'fees' ? 'open' : ''}`}
                      onClick={() => toggleSection('fees')}
                    >
                      <span>Fees &amp; Liabilities</span>
                      <span className="chevron">▾</span>
                    </button>
                    <div className={`accBody ${openSection === 'fees' ? 'open' : ''}`}>
                      <ul>
                        <li>
                          Buyer is responsible for all transportation costs (delivery
                          fees, mileage fees, tolls, overnight lodging, flight nanny, or
                          licensed ground transporter).
                        </li>
                        <li>
                          Once the puppy is released to the buyer, transporter, or airline
                          representative, Southwest Virginia Chihuahua is no longer
                          responsible for delays, accidents, illness, or loss during
                          transport.
                        </li>
                        <li>
                          Transportation stress does not extend or alter the terms of the
                          main Health Guarantee.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Hypoglycemia Warning Policy */}
                  <div className="accItem">
                    <button
                      type="button"
                      className={`accHeader ${openSection === 'hypo' ? 'open' : ''}`}
                      onClick={() => toggleSection('hypo')}
                    >
                      <span>Hypoglycemia Warning Policy</span>
                      <span className="chevron">▾</span>
                    </button>
                    <div className={`accBody ${openSection === 'hypo' ? 'open' : ''}`}>
                      <p>
                        Chihuahua puppies are especially prone to hypoglycemia (low blood
                        sugar), especially during travel, excitement, or any change in
                        routine.
                      </p>
                      <ul>
                        <li>
                          Buyer agrees to have Nutri-Cal, Karo syrup, or honey available
                          at pickup and to offer a pea-sized amount upon arrival.
                        </li>
                        <li>
                          Signs of hypoglycemia can include wobbliness, weakness,
                          glassy-eyed stare, low body temperature, or unresponsiveness.
                          These require immediate attention.
                        </li>
                        <li>
                          If any of these signs appear, buyer will immediately provide a
                          sugar source and seek emergency veterinary care.
                        </li>
                        <li>
                          Hypoglycemia is usually preventable with proper care and is not
                          considered a congenital defect covered by the Health Guarantee.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: CALENDAR + FORM */}
            <div className="transportRight">
              <div className="panel">
                <h2>Request Transportation</h2>
                <p className="muted">
                  Select an available date below. Only one transportation request is
                  accepted per day, so once a date is booked it will be greyed out for
                  everyone.
                </p>

                {/* CALENDAR */}
                <div className="calendar">
                  <div className="calendarHeader">
                    <button
                      type="button"
                      className="calNav"
                      onClick={() => changeMonth(-1)}
                    >
                      ‹
                    </button>
                    <span className="calMonth">{monthLabel}</span>
                    <button
                      type="button"
                      className="calNav"
                      onClick={() => changeMonth(1)}
                    >
                      ›
                    </button>
                  </div>
                  <div className="calendarWeekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="weekday">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="calendarGrid">
                    {days.map((day) => {
                      const isBooked = bookedDates.has(day.key)
                      const isSelected = selectedDate === day.key
                      const disabled = isBooked || !day.isCurrentMonth
                      const cls = ['dayBtn']
                      if (!day.isCurrentMonth) cls.push('outside')
                      if (isBooked) cls.push('booked')
                      if (isSelected) cls.push('selected')
                      return (
                        <button
                          key={day.key + '-' + day.label}
                          type="button"
                          className={cls.join(' ')}
                          disabled={disabled}
                          onClick={() => {
                            if (!disabled) setSelectedDate(day.key)
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className="calendarNote">
                    Gold = selected date. Greyed dates are already reserved or outside the
                    current month.
                  </p>
                  {selectedDate && (
                    <p className="calendarSelected">
                      Selected date: <strong>{selectedDate}</strong>
                    </p>
                  )}
                </div>

                {/* FORM */}
                <form className="transportForm" onSubmit={onSubmit}>
                  <fieldset className="fieldGroup">
                    <legend>Transportation Options</legend>
                    <p className="help">
                      Choose how you would like to receive your puppy. Details for each
                      option are in the Transportation Terms.
                    </p>
                    <label className="radioRow">
                      <input
                        type="radio"
                        name="option"
                        value="pick_up"
                        checked={form.option === 'pick_up'}
                        onChange={() => updateForm('option', 'pick_up')}
                      />
                      <span>Pick-Up in Person (at breeder&apos;s home or agreed location)</span>
                    </label>
                    <label className="radioRow">
                      <input
                        type="radio"
                        name="option"
                        value="breeder_delivery"
                        checked={form.option === 'breeder_delivery'}
                        onChange={() => updateForm('option', 'breeder_delivery')}
                      />
                      <span>Ground Transport – Breeder Delivery</span>
                    </label>
                    <label className="radioRow">
                      <input
                        type="radio"
                        name="option"
                        value="pro_transporter"
                        checked={form.option === 'pro_transporter'}
                        onChange={() => updateForm('option', 'pro_transporter')}
                      />
                      <span>Ground Transport – Professional Service (USDA-licensed)</span>
                    </label>
                    <label className="radioRow">
                      <input
                        type="radio"
                        name="option"
                        value="flight_nanny"
                        checked={form.option === 'flight_nanny'}
                        onChange={() => updateForm('option', 'flight_nanny')}
                      />
                      <span>Flight Nanny (in-cabin)</span>
                    </label>
                    <label className="radioRow">
                      <input
                        type="radio"
                        name="option"
                        value="other"
                        checked={form.option === 'other'}
                        onChange={() => updateForm('option', 'other')}
                      />
                      <span>Other</span>
                    </label>
                    {form.option === 'other' && (
                      <input
                        className="textInput"
                        placeholder="Describe other transportation arrangement"
                        value={form.otherOption}
                        onChange={(e) => updateForm('otherOption', e.target.value)}
                      />
                    )}
                  </fieldset>

                  <fieldset className="fieldGroup">
                    <legend>Preferred Meeting Location</legend>
                    <label>
                      <span className="fieldLabel">Street Address</span>
                      <input
                        className="textInput"
                        value={form.street}
                        onChange={(e) => updateForm('street', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      <span className="fieldLabel">Address Line 2</span>
                      <input
                        className="textInput"
                        value={form.street2}
                        onChange={(e) => updateForm('street2', e.target.value)}
                      />
                    </label>
                    <div className="fieldRow">
                      <label>
                        <span className="fieldLabel">City</span>
                        <input
                          className="textInput"
                          value={form.city}
                          onChange={(e) => updateForm('city', e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span className="fieldLabel">State / Region</span>
                        <input
                          className="textInput"
                          value={form.stateRegion}
                          onChange={(e) => updateForm('stateRegion', e.target.value)}
                          required
                        />
                      </label>
                    </div>
                    <div className="fieldRow">
                      <label>
                        <span className="fieldLabel">Postal / ZIP Code</span>
                        <input
                          className="textInput"
                          value={form.postal}
                          onChange={(e) => updateForm('postal', e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span className="fieldLabel">Country</span>
                        <input
                          className="textInput"
                          value={form.country}
                          onChange={(e) => updateForm('country', e.target.value)}
                          required
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="fieldGroup">
                    <legend>Backup Contact</legend>
                    <div className="fieldRow">
                      <label>
                        <span className="fieldLabel">First Name</span>
                        <input
                          className="textInput"
                          value={form.backupFirst}
                          onChange={(e) => updateForm('backupFirst', e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span className="fieldLabel">Last Name</span>
                        <input
                          className="textInput"
                          value={form.backupLast}
                          onChange={(e) => updateForm('backupLast', e.target.value)}
                          required
                        />
                      </label>
                    </div>
                    <label>
                      <span className="fieldLabel">Backup Phone Number</span>
                      <input
                        className="textInput"
                        value={form.backupPhone}
                        onChange={(e) => updateForm('backupPhone', e.target.value)}
                        required
                      />
                    </label>
                  </fieldset>

                  <fieldset className="fieldGroup">
                    <legend>Health &amp; Safety Agreement</legend>
                    <p className="help">
                      Please confirm you understand the health and safety expectations for
                      travel.
                    </p>
                    <ul className="tinyList">
                      <li>
                        I understand that all transportation methods carry some stress and
                        risk for the puppy.
                      </li>
                      <li>
                        I will have Nutri-Cal or honey on hand at pickup to help prevent
                        hypoglycemia.
                      </li>
                      <li>
                        I agree to schedule a veterinary check-up within 72 hours of
                        receiving my puppy.
                      </li>
                    </ul>
                    <label className="checkRow">
                      <input
                        type="checkbox"
                        checked={form.agreeHealth}
                        onChange={(e) => updateForm('agreeHealth', e.target.checked)}
                      />
                      <span>I have read and agree to the Health &amp; Safety Agreement.</span>
                    </label>
                  </fieldset>

                  <fieldset className="fieldGroup">
                    <legend>Fees &amp; Liability</legend>
                    <ul className="tinyList">
                      <li>
                        Buyer is responsible for all transportation costs, including
                        delivery fees, flight nanny, or transporter.
                      </li>
                      <li>
                        Breeder is not liable for delays or accidents once the puppy is in
                        the care of a transporter, airline, or third party.
                      </li>
                      <li>
                        If I fail to appear at the agreed pickup/delivery time, additional
                        fees may apply.
                      </li>
                    </ul>
                    <label className="checkRow">
                      <input
                        type="checkbox"
                        checked={form.agreeFees}
                        onChange={(e) => updateForm('agreeFees', e.target.checked)}
                      />
                      <span>I understand and accept the Fees &amp; Liability terms.</span>
                    </label>
                  </fieldset>

                  <fieldset className="fieldGroup">
                    <legend>Notes &amp; Confirmation</legend>
                    <label>
                      <span className="fieldLabel">Notes for the breeder (optional)</span>
                      <textarea
                        className="textArea"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                      />
                    </label>
                    <p className="help">
                      All puppies must be paid in full before they are released to you or
                      to any transporter.
                    </p>
                    <label className="checkRow">
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={(e) => updateForm('acceptTerms', e.target.checked)}
                      />
                      <span>
                        I accept the Transportation Terms &amp; Conditions and acknowledge
                        that my puppy must be paid in full prior to release.
                      </span>
                    </label>
                  </fieldset>

                  <button className="btn primary" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Transportation Request'}
                  </button>

                  {status && (
                    <div className={`note ${status.kind === 'success' ? 'ok' : 'bad'}`}>
                      {status.text}
                    </div>
                  )}

                  {!hasEnv && (
                    <div className="note bad" style={{ marginTop: 8 }}>
                      Portal configuration is missing Supabase connection details. Please
                      notify the breeder so this page can be fully enabled.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>

          <footer className="ft">
            <span className="mini">
              © {new Date().getFullYear()} Southwest Virginia Chihuahua
            </span>
            <span className="mini">Virginia&apos;s Premier Chihuahua Breeder.</span>
          </footer>
        </section>
      </div>

      {/* ============================================ */}
      {/* STYLES */}
      {/* ============================================ */}
      <style jsx>{`
        :root {
          --bg: ${THEME.bg};
          --sidebar: ${THEME.sidebar};
          --panelBorder: ${THEME.panelBorder};
          --ink: ${THEME.ink};
          --muted: ${THEME.muted};
          --brand: ${THEME.brand};
          --brandAlt: ${THEME.brandAlt};
        }

        main {
          min-height: 100vh;
          background:
            radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),
            radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),
            var(--bg);
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
        }

        .shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 20px 28px;
          display: flex;
          gap: 20px;
        }

        /* SIDEBAR */

        .sidebar {
          width: 230px;
          flex-shrink: 0;
          background: var(--sidebar);
          border-radius: 20px;
          border: 1px solid var(--panelBorder);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.75);
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .brand {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pupmark {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          box-shadow: inset 0 0 0 3px #020617;
        }

        .pawbubble {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #020617;
          opacity: 0.6;
        }
        .pawbubble:nth-child(1) {
          top: 9px;
          left: 11px;
        }
        .pawbubble:nth-child(2) {
          top: 13px;
          left: 23px;
        }
        .pawbubble:nth-child(3) {
          top: 22px;
          left: 16px;
        }

        .brandText {
          line-height: 1.1;
        }
        .brandLine1 {
          font-weight: 700;
          font-size: 14px;
        }
        .brandLine2 {
          font-size: 11px;
          color: var(--muted);
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .navItem {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #111827;
          color: var(--ink);
          text-decoration: none;
          font-size: 13px;
          transition: background 0.12s ease, transform 0.12s ease,
            border-color 0.12s ease, box-shadow 0.12s ease;
        }

        .navItem:hover {
          transform: translateY(-1px);
          background: #020617;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
        }

        .navItem.active {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          border-color: transparent;
          color: #111827;
        }

        .navIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .navLabel {
          flex: 1;
        }

        /* MAIN */

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero {
          border-radius: 24px;
          padding: 20px 22px;
          border: 1px solid var(--panelBorder);
          background:
            radial-gradient(120% 220% at 0 0, rgba(224, 169, 109, 0.18), transparent 55%),
            linear-gradient(145deg, #020617, #020617);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85);
        }

        .hero h1 {
          margin: 0 0 6px;
          font-size: clamp(24px, 3vw, 32px);
        }
        .hero p {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        .transportContent {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .transportLeft {
          flex: 1.1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .transportRight {
          flex: 1;
          min-width: 320px;
        }

        .panel {
          border-radius: 18px;
          border: 1px solid var(--panelBorder);
          background: radial-gradient(
              140% 160% at 0 0,
              rgba(224, 169, 109, 0.08),
              transparent 50%
            ),
            #020617;
          padding: 18px 18px 20px;
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.9);
        }

        .panel h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .muted {
          color: var(--muted);
          font-size: 13px;
          margin-bottom: 10px;
        }

        /* ACCORDION */

        .accordion {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .accItem {
          border-radius: 12px;
          border: 1px solid #111827;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.9);
        }

        .accHeader {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: transparent;
          color: var(--ink);
          border: none;
          font-size: 14px;
          cursor: pointer;
        }

        .accHeader .chevron {
          font-size: 12px;
          opacity: 0.7;
          transform: rotate(0deg);
          transition: transform 0.12s ease;
        }

        .accHeader.open .chevron {
          transform: rotate(180deg);
        }

        .accBody {
          max-height: 0;
          overflow: hidden;
          padding: 0 12px;
          font-size: 13px;
          color: var(--muted);
          transition: max-height 0.18s ease, padding 0.18s ease;
        }

        .accBody.open {
          max-height: 600px;
          padding: 0 12px 10px;
        }

        .accBody h4 {
          margin: 8px 0 4px;
          font-size: 13px;
          color: var(--ink);
        }

        .accBody ul {
          margin: 0 0 4px 16px;
          padding: 0;
          list-style: disc;
        }

        /* CALENDAR */

        .calendar {
          margin-top: 8px;
          border-radius: 14px;
          border: 1px solid #111827;
          padding: 10px 10px 12px;
          background: rgba(15, 23, 42, 0.9);
        }

        .calendarHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .calMonth {
          font-weight: 600;
          font-size: 14px;
        }

        .calNav {
          border-radius: 999px;
          border: 1px solid #1f2937;
          background: #020617;
          color: var(--ink);
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
        }

        .calendarWeekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .weekday {
          text-align: center;
        }

        .calendarGrid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .dayBtn {
          border-radius: 8px;
          border: 1px solid #111827;
          background: #020617;
          color: var(--ink);
          font-size: 11px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .dayBtn.outside {
          opacity: 0.3;
        }

        .dayBtn.booked {
          background: #111827;
          color: #4b5563;
          cursor: not-allowed;
        }

        .dayBtn.selected {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          border-color: transparent;
          color: #111827;
          font-weight: 600;
        }

        .calendarNote,
        .calendarSelected {
          margin: 6px 0 0;
          font-size: 11px;
          color: var(--muted);
        }

        .calendarSelected strong {
          color: var(--brand);
        }

        /* FORM */

        .transportForm {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .fieldGroup {
          border-radius: 12px;
          border: 1px solid #111827;
          padding: 10px 10px 12px;
          background: rgba(15, 23, 42, 0.9);
        }

        .fieldGroup legend {
          padding: 0 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .help {
          margin: 4px 0 6px;
          font-size: 12px;
          color: var(--muted);
        }

        .radioRow {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .radioRow input {
          margin-top: 2px;
        }

        .fieldLabel {
          display: block;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 2px;
        }

        .textInput,
        .textArea {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #1f2937;
          background: #020617;
          color: var(--ink);
          padding: 6px 8px;
          font-size: 13px;
        }

        .textInput:focus,
        .textArea:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 1px rgba(224, 169, 109, 0.5);
        }

        .textArea {
          resize: vertical;
          min-height: 70px;
        }

        .fieldRow {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .fieldRow label {
          flex: 1;
        }

        .tinyList {
          margin: 0 0 4px 16px;
          padding: 0;
          list-style: disc;
          font-size: 12px;
          color: var(--muted);
        }

        .checkRow {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          margin-top: 4px;
        }

        .checkRow input {
          margin-top: 2px;
        }

        .btn {
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 14px;
          border: none;
          cursor: pointer;
        }

        .btn.primary {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          font-weight: 600;
          align-self: flex-start;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
        }

        .btn.primary:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .note {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
        }
        .note.ok {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.5);
          color: #bbf7d0;
        }
        .note.bad {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fecaca;
        }

        .ft {
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 11px;
          color: var(--muted);
        }

        .mini {
          opacity: 0.8;
        }

        @media (max-width: 960px) {
          .shell {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            gap: 12px;
          }
          .nav {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .navItem {
            flex: none;
          }
        }

        @media (max-width: 720px) {
          .shell {
            padding: 14px 10px 20px;
          }
          .sidebar {
            flex-direction: column;
            align-items: flex-start;
          }
          .transportContent {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  )
}
