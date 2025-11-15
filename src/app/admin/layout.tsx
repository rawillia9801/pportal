'use client'

/* ============================================
   CHANGELOG
   - 2025-11-15: Admin Dashboard moved to its
                 own route (/admin) instead of
                 being mixed with other tabs.
   ============================================ */

import React, { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'

type DashboardCounts = {
  buyers: number | null
  puppies: number | null
  applications: number | null
  payments: number | null
  messages: number | null
  transports: number | null
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    buyers: null,
    puppies: null,
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
            .select('id', { head: true, count: 'exact' })
          if (error) return null
          return count ?? null
        } catch {
          return null
        }
      }

      const [
        buyers,
        puppies,
        applications,
        payments,
        messages,
        transports,
      ] = await Promise.all([
        safeCount('puppy_buyers'),
        safeCount('puppies'),
        safeCount('puppy_applications'),
        safeCount('puppy_payments'),
        safeCount('puppy_messages'),
        safeCount('puppy_transport'),
      ])

      if (!cancelled) {
        setCounts({
          buyers,
          puppies,
          applications,
          payments,
          messages,
          transports,
        })
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    {
      label: 'BUYERS',
      value: counts.buyers,
      hint: 'Approved families',
    },
    {
      label: 'PUPPIES',
      value: counts.puppies,
      hint: 'In the system',
    },
    {
      label: 'APPLICATIONS',
      value: counts.applications,
      hint: 'Pending or reviewed',
    },
    {
      label: 'PAYMENTS',
      value: counts.payments,
      hint: 'Recorded payments',
    },
    {
      label: 'MESSAGES',
      value: counts.messages,
      hint: 'Conversations',
    },
    {
      label: 'TRANSPORT REQUESTS',
      value: counts.transports,
      hint: 'Trips to plan',
    },
  ]

  return (
    <div>
      <h1 className="adminPageTitle">Admin Dashboard</h1>
      <p className="adminPageSub">
        Quick overview of your program. Use the sidebar to move into each
        workflow for detailed management.
      </p>

      <div className="adminStatGrid">
        {cards.map((c) => (
          <div key={c.label} className="adminStatCard">
            <div className="adminStatLabel">{c.label}</div>
            <div className="adminStatValue">
              {loading ? '—' : c.value ?? '—'}
            </div>
            <div className="adminStatHint">{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
