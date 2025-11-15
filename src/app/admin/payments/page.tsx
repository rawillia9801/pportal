'use client'

/* CHANGELOG: 2025-11-15 Payments moved to /admin/payments */

import React, { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'

/* types: PaymentRow, YearSummary, PaymentStats (same as before) */

export default function PaymentsPage() {
  // fetch from puppy_payments, group by year, etc.
  // render summary pills + table using the lighter card styles
}
