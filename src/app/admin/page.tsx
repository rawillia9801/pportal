'use client'

/* ============================================
   ADMIN DASHBOARD (CLIENT-PROTECTED)
   - Checks Supabase auth on mount
   - If not logged in  → /login?reason=admin
   - If logged in but not allowed (when ADMIN_EMAILS set) → /dashboard
   - Otherwise shows admin UI.

   Optional env:
   NEXT_PUBLIC_ADMIN_EMAILS = "you@example.com, other@example.com"
   If empty, any logged-in user can see /admin.
   ============================================ */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Parse allowed admin emails from env (optional).
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  if (ADMIN_EMAILS.length === 0) {
    // No list configured → allow any logged-in user
    return true
  }
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

type Status = 'checking' | 'ready'

export default function AdminPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = getBrowserClient()
    let cancelled = false

    ;(async () => {
      const { data, error } = await supabase.auth.getUser()

      if (cancelled) return

      const currentUser = data?.user ?? null

      // Not logged in → go to login
      if (error || !currentUser) {
        router.replace('/login?reason=admin')
        return
      }

      // Logged in but not allowed when ADMIN_EMAILS is configured
      if (!isAllowedAdmin(currentUser.email)) {
        router.replace('/dashboard')
        return
      }

      setUser(currentUser)
      setStatus('ready')
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  // While we are checking access
  if (status === 'checking') {
    return (
      <main className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="admin-brand-mark" />
            <div className="admin-brand-text">
              <div className="admin-brand-line1">SWVA Chihuahua</div>
              <div className="admin-brand-line2">Admin Access</div>
            </div>
          </div>
        </aside>
        <section className="admin-main">
          <div className="admin-header">
            <h1>Checking admin access…</h1>
            <p className="admin-tagline">
              Verifying your session and permissions for the breeder admin panel.
            </p>
          </div>
        </section>
        <AdminStyles />
      </main>
    )
  }

  // MAIN ADMIN UI
  return (
    <main className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark" />
          <div className="admin-brand-text">
            <div className="admin-brand-line1">SWVA Chihuahua</div>
            <div className="admin-brand-line2">Breeder Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          <Link className="admin-nav-item admin-nav-item-active" href="/admin">
            Overview
          </Link>
          <Link className="admin-nav-item" href="/admin/puppies">
            Puppies & Litters
          </Link>
          <Link className="admin-nav-item" href="/admin/buyers">
            Buyers & Applications
          </Link>
          <Link className="admin-nav-item" href="/admin/contracts">
            Contracts & Documents
          </Link>
          <Link className="admin-nav-item" href="/admin/payments">
            Payments & Financing
          </Link>
          <Link className="admin-nav-item" href="/admin/reports">
            Reports & Analytics
          </Link>
          <Link className="admin-nav-item" href="/dashboard">
            Back to Puppy Portal
          </Link>
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-user-pill">
            <div className="admin-user-avatar">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-meta">
              <div className="admin-user-email">
                {user?.email || 'breeder@swvachihuahua.com'}
              </div>
              <div className="admin-user-role">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-tagline">
              Internal breeder view for puppies, buyers, contracts, and financials.
            </p>
          </div>
        </header>

        {/* Top metrics */}
        <section className="admin-metrics">
          <div className="admin-card">
            <div className="admin-card-label">Active Litters</div>
            <div className="admin-card-value">3</div>
            <div className="admin-card-note">Puppies currently on the ground</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Applications Pending</div>
            <div className="admin-card-value">5</div>
            <div className="admin-card-note">Awaiting review or approval</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Open Payment Plans</div>
            <div className="admin-card-value">4</div>
            <div className="admin-card-note">With outstanding balances</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Messages Unread</div>
            <div className="admin-card-value">2</div>
            <div className="admin-card-note">Follow up with families</div>
          </div>
        </section>

        {/* Two-column layout: left (work queues), right (notes) */}
        <section className="admin-grid">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>Quick Actions</h2>
              <span className="admin-panel-sub">
                Shortcut buttons you’ll use most often.
              </span>
            </div>
            <div className="admin-actions-grid">
              <Link href="/admin/puppies/add" className="admin-action">
                <div className="admin-action-title">Add New Litter</div>
                <div className="admin-action-body">
                  Register a dam, sire, DOB, colors, and projected ready date.
                </div>
              </Link>
              <Link href="/admin/buyers" className="admin-action">
                <div className="admin-action-title">Review Applications</div>
                <div className="admin-action-body">
                  Approve, decline, or request more info from potential buyers.
                </div>
              </Link>
              <Link href="/admin/contracts" className="admin-action">
                <div className="admin-action-title">Prepare Contracts</div>
                <div className="admin-action-body">
                  Generate Bill of Sale, Health Guarantee, and financing addenda.
                </div>
              </Link>
              <Link href="/admin/payments" className="admin-action">
                <div className="admin-action-title">Record Payment</div>
                <div className="admin-action-body">
                  Log deposits, balances, or cash payments from buyers.
                </div>
              </Link>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>Today&apos;s Focus</h2>
              <span className="admin-panel-sub">
                Use this as a quick breeder checklist.
              </span>
            </div>
            <ul className="admin-task-list">
              <li>✅ Confirm weights and photos for this week&apos;s litters.</li>
              <li>✅ Reply to any outstanding buyer messages.</li>
              <li>⬜ Verify that all upcoming pickups have signed contracts.</li>
              <li>⬜ Double-check payment plans that are due this week.</li>
              <li>⬜ Review any new applications for Ember & Bubba&apos;s litter.</li>
            </ul>
            <p className="admin-note">
              This panel is just static text for now. Later, we can wire it to real
              data from Supabase (applications table, puppies table, payments, etc.).
            </p>
          </div>
        </section>
      </section>

      <AdminStyles />
    </main>
  )
}

// Styled-JSX CSS kept in a separate component for reuse between states
function AdminStyles() {
  return (
    <style jsx>{`
      .admin-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px 1fr;
        background: linear-gradient(180deg, #f7f9ff, #e5edff);
        color: #0f172a;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          sans-serif;
      }

      .admin-sidebar {
        padding: 20px 18px;
        border-right: 1px solid rgba(15, 23, 42, 0.08);
        background: linear-gradient(180deg, #ffffffee, #f5f7ffdd);
        backdrop-filter: blur(8px);
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 16px;
      }

      .admin-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .admin-brand-mark {
        width: 36px;
        height: 36px;
        border-radius: 14px;
        background: linear-gradient(135deg, #fbbf77, #e0a96d);
        box-shadow: 0 10px 25px rgba(249, 115, 22, 0.35);
      }

      .admin-brand-text {
        line-height: 1.1;
      }

      .admin-brand-line1 {
        font-size: 14px;
        font-weight: 700;
      }

      .admin-brand-line2 {
        font-size: 11px;
        color: #6b7280;
      }

      .admin-nav {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .admin-nav-item {
        display: block;
        padding: 8px 11px;
        border-radius: 999px;
        font-size: 13px;
        text-decoration: none;
        color: #111827;
        border: 1px solid transparent;
        background: transparent;
        transition: background 0.15s ease, transform 0.12s ease,
          box-shadow 0.12s ease, border-color 0.12s ease;
      }

      .admin-nav-item:hover {
        background: #eef2ff;
        border-color: rgba(79, 70, 229, 0.2);
        box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1);
        transform: translateY(-1px);
      }

      .admin-nav-item-active {
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #eff6ff;
        border-color: transparent;
        box-shadow: 0 10px 22px rgba(79, 70, 229, 0.4);
      }

      .admin-sidebar-foot {
        margin-top: 10px;
      }

      .admin-user-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        background: #eef2ff;
        border: 1px solid rgba(129, 140, 248, 0.6);
      }

      .admin-user-avatar {
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: #4f46e5;
        color: #e5edff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
      }

      .admin-user-meta {
        line-height: 1.1;
      }

      .admin-user-email {
        font-size: 11px;
        font-weight: 600;
      }

      .admin-user-role {
        font-size: 10px;
        color: #6b7280;
      }

      .admin-main {
        padding: 22px 26px 28px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .admin-header h1 {
        margin: 0;
        font-size: 24px;
      }

      .admin-tagline {
        margin: 4px 0 0;
        font-size: 13px;
        color: #6b7280;
      }

      .admin-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
      }

      .admin-card {
        border-radius: 16px;
        padding: 12px 13px 14px;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.4);
        box-shadow: 0 10px 22px rgba(148, 163, 184, 0.25);
      }

      .admin-card-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 3px;
      }

      .admin-card-value {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 2px;
      }

      .admin-card-note {
        font-size: 11px;
        color: #9ca3af;
      }

      .admin-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
        gap: 18px;
        align-items: flex-start;
      }

      .admin-panel {
        border-radius: 18px;
        padding: 14px 15px 16px;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.4);
        box-shadow: 0 12px 28px rgba(148, 163, 184, 0.25);
      }

      .admin-panel-head h2 {
        margin: 0;
        font-size: 16px;
      }

      .admin-panel-sub {
        font-size: 12px;
        color: #6b7280;
      }

      .admin-actions-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
      }

      .admin-action {
        display: block;
        padding: 10px 11px 12px;
        border-radius: 13px;
        text-decoration: none;
        background: #f9fafb;
        border: 1px solid rgba(148, 163, 184, 0.55);
        color: #111827;
        font-size: 13px;
        transition: background 0.12s ease, transform 0.12s ease,
          box-shadow 0.12s ease, border-color 0.12s ease;
      }

      .admin-action:hover {
        background: #eef2ff;
        border-color: rgba(79, 70, 229, 0.5);
        box-shadow: 0 10px 20px rgba(129, 140, 248, 0.35);
        transform: translateY(-1px);
      }

      .admin-action-title {
        font-weight: 600;
        margin-bottom: 3px;
      }

      .admin-action-body {
        font-size: 12px;
        color: #6b7280;
      }

      .admin-task-list {
        margin: 10px 0 8px 18px;
        padding: 0;
        font-size: 12px;
        color: #4b5563;
      }

      .admin-task-list li {
        margin-bottom: 4px;
      }

      .admin-note {
        font-size: 11px;
        color: #9ca3af;
        margin: 4px 0 0;
      }

      @media (max-width: 960px) {
        .admin-shell {
          grid-template-columns: 1fr;
        }
        .admin-sidebar {
          border-right: none;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          grid-template-rows: auto auto auto;
        }
      }

      @media (max-width: 720px) {
        .admin-main {
          padding: 18px 16px 20px;
        }
        .admin-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  )
}
