'use client';

/* ============================================
   CHANGELOG
   - 2025-11-11: Full Admin Dashboard (tabs + admin gate)
   - 2025-11-11: Fix: newline-safe Recent Activity via NL constant
   - 2025-11-11: Add Puppy uses Sire/Dam dropdowns from dogs table
   - 2025-11-11: Buyers tab: Add + Edit + Delete (full CRUD)
   - 2025-11-11: Applications: Review/Approve drawer with puppy assignment
   ============================================ */
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

/* ========== Types ========== */
type Puppy = {
  id: string;
  name: string | null;
  price: number | null;
  status: 'Available' | 'Reserved' | 'Sold' | null;
  gender: 'Male' | 'Female' | null;
  registry: 'AKC' | 'CKC' | 'ACA' | null;
  dob: string | null;
  ready_date: string | null;
  photos: any[] | null;
  sire_id: string | null;
  dam_id: string | null;
  application_id?: string | null; // may not exist yet; code guards for it
  created_at?: string | null;
};
type Application = {
  id: string;
  user_id?: string | null; // optional if present in your table
  buyer_name: string | null;
  email: string | null;
  phone: string | null;
  status: 'submitted' | 'approved' | 'denied' | null;
  submitted_at: string | null;
};
type Buyer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_repeat: boolean | null;
  created_at: string | null;
};
type Payment = {
  id: string;
  buyer_id: string | null;
  puppy_id: string | null;
  amount: number | null;
  method: string | null;
  note: string | null;
  paid_at: string | null;
};
type MessageRow = {
  id: string;
  buyer_id: string | null;
  puppy_id: string | null;
  sender: string | null; // 'admin' | 'buyer'
  body: string | null;
  created_at: string | null;
};
type DocRow = {
  id: string;
  application_id?: string | null; // might not exist in your table yet
  buyer_id?: string | null;
  puppy_id?: string | null;
  label?: string | null;
  file_key: string | null;
  uploaded_at?: string | null;
};
type Transport = {
  id: string;
  buyer_id: string | null;
  puppy_id: string | null;
  method: string | null; // Pickup | Ground Delivery | Flight Nanny
  city: string | null;
  state: string | null;
  date: string | null; // YYYY-MM-DD
  note: string | null;
  created_at: string | null;
};
type Dog = { id: string; name: string; sex: 'Male' | 'Female' };

/* ========== Config ========== */
const ADMIN_EMAIL = 'rawillia9809@gmail.com';
const NL = String.fromCharCode(10);

type TabKey =
  | 'overview' | 'puppies' | 'litters' | 'applications' | 'buyers'
  | 'payments' | 'messages' | 'documents' | 'transport' | 'reports' | 'settings';

/* ========== Page ========== */
export default function AdminDashboardPage() {
  const r = useRouter();
  const supabase = getBrowserClient();

  // Gate
  const [me, setMe] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [loadingGate, setLoadingGate] = useState(true);

  // Tabs
  const [tab, setTab] = useState<TabKey>('overview');

  // Overview
  const [kpiPuppies, setKpiPuppies] = useState<number | string>('—');
  const [kpiApps, setKpiApps] = useState<number | string>('—');
  const [kpiPayments, setKpiPayments] = useState<string>('—');
  const [recentActivity, setRecentActivity] = useState<string>('Loading…');

  // Puppies
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [puppyMsg, setPuppyMsg] = useState<string>('');
  const puppySearchRef = useRef<HTMLInputElement>(null);

  // Dogs (for Sire/Dam dropdowns)
  const [dogs, setDogs] = useState<Dog[]>([]);
  const maleDogs = dogs.filter(d => d.sex === 'Male');
  const femaleDogs = dogs.filter(d => d.sex === 'Female');

  // Litters
  const [litters, setLitters] = useState<any[]>([]);
  const [litterMsg, setLitterMsg] = useState<string>('');

  // Applications
  const [apps, setApps] = useState<Application[]>([]);
  const [appFilter, setAppFilter] =
    useState<'all' | 'submitted' | 'approved' | 'denied'>('all');

  // Buyers
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerMsg, setBuyerMsg] = useState<string>('');
  const [editBuyer, setEditBuyer] = useState<Buyer | null>(null);

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMsg, setPaymentMsg] = useState<string>('');

  // Messages
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageMsg, setMessageMsg] = useState<string>('');

  // Documents
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [docMsg, setDocMsg] = useState<string>('');

  // Transport
  const [transports, setTransports] = useState<Transport[]>([]);
  const [transportMsg, setTransportMsg] = useState<string>('');

  // Reports
  const [reportSummary, setReportSummary] = useState<string>('Loading…');
  const [reportSignals, setReportSignals] = useState<string[]>([]);
  const [paymentsAscii, setPaymentsAscii] = useState<string>('');

  // Approve Drawer
  const [approveOpen, setApproveOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [availablePups, setAvailablePups] = useState<Puppy[]>([]);
  const [selectedPupId, setSelectedPupId] = useState<string>('');
  const [appDocUrl, setAppDocUrl] = useState<string>('');
  const [approving, setApproving] = useState(false);
  const [approveMsg, setApproveMsg] = useState<string>('');

  /* ========== Helpers ========== */
  function fmtMoney(n: number | null | undefined) {
    if (n == null || Number.isNaN(n)) return '-';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function titleFor(t: TabKey) {
    return ({
      overview: 'Overview', puppies: 'Puppies', litters: 'Litters',
      applications: 'Applications', buyers: 'Buyers', payments: 'Payments',
      messages: 'Messages', documents: 'Documents', transport: 'Transportation',
      reports: 'Reports', settings: 'Settings'
    } as const)[t];
  }
  function Badge({ status }: { status?: string | null }) {
    const norm = (status || '').toLowerCase();
    const cls = norm === 'sold' ? 'danger' : norm === 'reserved' ? 'warn' : 'ok';
    return <span className={`badge ${cls}`}>{status || '-'}</span>;
  }
function toPublicUrl(key: string): string {
  try {
    const { data } = supabase.storage.from('docs').getPublicUrl(key);
    return data?.publicUrl ?? '';
  } catch {
    return '';
  }
}
  /* ========== Loaders ========== */
  async function loadOverview() {
    try {
      const { count } = await supabase.from('puppies')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Sold');
      setKpiPuppies(count ?? '—');
    } catch { setKpiPuppies('—'); }

    try {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { count } = await supabase.from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('submitted_at', since)
        .eq('status', 'approved');
      setKpiApps(count ?? '—');
    } catch { setKpiApps('—'); }

    try {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase.from('payments')
        .select('amount,paid_at')
        .gte('paid_at', since)
        .order('paid_at', { ascending: false })
        .limit(10);

      const total = (data || []).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
      setKpiPayments(fmtMoney(total));

      const lines = (data || []).map(
        (r: any) => `Payment ${fmtMoney(r.amount)} on ${new Date(r.paid_at).toLocaleString()}`
      );
      setRecentActivity(lines.length ? lines.join(NL) : 'No recent activity.');
    } catch { setRecentActivity('—'); }
  }

  async function loadPuppies(query?: string) {
    let rq = supabase.from('puppies').select('*')
      .order('created_at', { ascending: false }).limit(200);
    if (query && query.trim()) {
      rq = supabase.from('puppies').select('*')
        .or(`name.ilike.%${query}%,registry.ilike.%${query}%`)
        .order('created_at', { ascending: false }).limit(200);
    }
    const { data } = await rq;
    setPuppies((data as Puppy[]) || []);
  }
  async function loadAvailableOnly() {
    const { data } = await supabase.from('puppies')
      .select('id,name,status,gender,registry,price,dob,ready_date,photos,application_id')
      .eq('status', 'Available')
      .order('dob', { ascending: true })
      .limit(200);
    setAvailablePups((data as Puppy[]) || []);
  }

  async function loadDogs() {
    const { data, error } = await supabase
      .from('dogs')
      .select('id,name,sex')
      .eq('active', true)
      .order('name', { ascending: true });
    if (!error) setDogs((data as Dog[]) || []);
  }

  async function loadLitters() {
    const { data } = await supabase.from('litters').select('*')
      .order('whelp_date', { ascending: false }).limit(200);
    setLitters(data || []);
  }
  async function loadApplications(filter: 'all' | 'submitted' | 'approved' | 'denied') {
    let rq = supabase.from('applications').select('*')
      .order('submitted_at', { ascending: false }).limit(200);
    if (filter !== 'all') rq = rq.eq('status', filter);
    const { data } = await rq;
    setApps((data as Application[]) || []);
  }
  async function loadBuyers() {
    const { data } = await supabase.from('buyers').select('*')
      .order('created_at', { ascending: false }).limit(200);
    setBuyers((data as Buyer[]) || []);
  }
  async function loadPayments() {
    const { data } = await supabase.from('payments').select('*')
      .order('paid_at', { ascending: false }).limit(200);
    setPayments((data as Payment[]) || []);
  }
  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*')
      .order('created_at', { ascending: false }).limit(100);
    setMessages((data as MessageRow[]) || []);
  }
  async function loadDocuments() {
    const { data } = await supabase.from('documents').select('*')
      .order('uploaded_at', { ascending: false }).limit(200);
    setDocs((data as DocRow[]) || []);
  }
  async function loadTransports() {
    const { data } = await supabase.from('transportations').select('*')
      .order('created_at', { ascending: false }).limit(200);
    setTransports((data as Transport[]) || []);
  }
  async function refreshReports() {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: pays } = await supabase.from('payments')
      .select('amount,paid_at').gte('paid_at', since).order('paid_at');
    const sum = (pays || []).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    setReportSummary(`Total payments last 30 days: ${fmtMoney(sum)} (${(pays || []).length} tx)`);
    const avg = sum / Math.max(1, (pays || []).length);
    const big = biggestDay(pays || []);
    setReportSignals([
      `Avg payment size: ${fmtMoney(avg)}`,
      `Biggest day: ${fmtMoney(big.total)} on ${new Date(big.day).toLocaleDateString()}`
    ]);
    setPaymentsAscii(asciiBarByDay(pays || []));
  }
  function biggestDay(rows: any[]) {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.paid_at); d.setHours(0,0,0,0);
      const key = d.toISOString();
      map.set(key, (map.get(key) || 0) + (Number(r.amount) || 0));
    }
    let best = { day: new Date().toISOString(), total: 0 };
    for (const [k, v] of map) if (v > best.total) best = { day: k, total: v };
    return best;
  }
  function asciiBarByDay(rows: any[]) {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.paid_at);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + (Number(r.amount) || 0));
    }
    const days = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    if (!days.length) return 'No data.';
    const max = Math.max(...days.map(([, v]) => v));
    return days
      .map(([day, val]) => {
        const len = max ? Math.round((val / max) * 40) : 0;
        return `${day} | ${'#'.repeat(len)} ${fmtMoney(val)}`;
      })
      .join(NL);
  }

  /* ========== Approve Drawer Flow ========== */
  async function findApplicationDocUrl(app: Application): Promise<string> {
    // Try 1: documents.application_id = app.id
    try {
      const q1 = await supabase
        .from('documents')
        .select('file_key')
        .eq('application_id', app.id)
        .order('uploaded_at', { ascending: false })
        .limit(1);

      const key1 = q1.data?.[0]?.file_key as string | undefined;
      if (key1) {
        const url1 = toPublicUrl(key1);
        if (url1) return url1;
      }
    } catch { /* ignored */ }

    // Try 2: fallback by buyer/user id with a loose label match
    try {
      const buyerId = (app as any).user_id || (app as any).buyer_id || null;
      if (buyerId) {
        const q2 = await supabase
          .from('documents')
          .select('file_key')
          .eq('buyer_id', buyerId)
          .ilike('label', '%Application%')
          .order('uploaded_at', { ascending: false })
          .limit(1);

        const key2 = q2.data?.[0]?.file_key as string | undefined;
        if (key2) {
          const url2 = toPublicUrl(key2);
          if (url2) return url2;
        }
      }
    } catch { /* ignored */ }

    return '';
  }

  async function onOpenApprove(app: Application) {
    setActiveApp(app);
    setApproveMsg('');
    setSelectedPupId('');
    setAppDocUrl('');
    setApproveOpen(true);
    await Promise.all([
      loadAvailableOnly(),
      (async () => {
        const url = await findApplicationDocUrl(app);
        if (url) setAppDocUrl(url);
      })(),
    ]);
  }

  async function approveAndAssign() {
    if (!activeApp) return;
    if (!selectedPupId) { setApproveMsg('Select a puppy to assign.'); return; }
    setApproving(true);
    setApproveMsg('');

    try {
      // Reserve + link to application_id if the column exists; otherwise fallback to just reserve
      let pupError: any = null;
      {
        const { error } = await supabase
          .from('puppies')
          .update({ status: 'Reserved', application_id: (activeApp as any).id })
          .eq('id', selectedPupId)
          .eq('status', 'Available');
        pupError = error;
      }
      if (pupError) {
        const { error: fallbackErr } = await supabase
          .from('puppies')
          .update({ status: 'Reserved' })
          .eq('id', selectedPupId)
          .eq('status', 'Available');
        if (fallbackErr) throw fallbackErr;
      }

      const { error: appErr } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', (activeApp as any).id);
      if (appErr) throw appErr;

      await Promise.all([
        loadApplications(appFilter),
        loadPuppies(puppySearchRef.current?.value || ''),
      ]);
      setApproveOpen(false);
      setActiveApp(null);
      setSelectedPupId('');
      setApproveMsg('');
    } catch (e: any) {
      setApproveMsg(e?.message || 'Approval failed.');
    } finally {
      setApproving(false);
    }
  }

  /* ========== Simple handlers for old Approve/Deny fallbacks ========== */
  async function approveApp(id: string) {
    const { error } = await supabase.from('applications').update({ status: 'approved' }).eq('id', id);
    if (error) alert(error.message); else loadApplications(appFilter);
  }
  async function denyApp(id: string) {
    const { error } = await supabase.from('applications').update({ status: 'denied' }).eq('id', id);
    if (error) alert(error.message); else loadApplications(appFilter);
  }

  /* ========== Form Handlers (existing) ========== */
  // Puppies
/* ANCHOR: onAddPuppy */
/* ANCHOR: onAddPuppy */
async function onAddPuppy(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setPuppyMsg('');

  const fd = new FormData(e.currentTarget);
  const firstPhoto = (fd.get('photo') as string | null)?.trim();
  const photos = firstPhoto ? [firstPhoto] : [];

  const row = {
    name: (fd.get('name') as string) || null,
    price: fd.get('price') ? Number(fd.get('price')) : null,
    status: ((fd.get('status') as string) || 'Available') as Puppy['status'],
    gender: (fd.get('gender') as Puppy['gender']) || null,
    registry: (fd.get('registry') as Puppy['registry']) || null,
    dob: (fd.get('dob') as string) || null,
    ready_date: (fd.get('ready_date') as string) || null,
    photos,
    sire_id: (fd.get('sire_id') as string) || null,
    dam_id: (fd.get('dam_id') as string) || null,
  };

  const { error } = await supabase.from('puppies').insert(row);
  setPuppyMsg(error ? error.message : 'Saved.');

  if (!error) {
    (e.currentTarget as HTMLFormElement).reset();
    await loadPuppies(puppySearchRef.current?.value || '');
  }
    const { error } = await supabase.from('puppies').insert(row);
    setPuppyMsg(error ? error.message : 'Saved.');
    if (!error) {
      (e.currentTarget as HTMLFormElement).reset();
      await loadPuppies(puppySearchRef.current?.value || '');
    }
  }
    const { error } = await supabase.from('puppies').insert(row);
    setPuppyMsg(error ? error.message : 'Saved.');
    if (!error) {
      (e.currentTarget as HTMLFormElement).reset();
      await loadPuppies(puppySearchRef.current?.value || '');
    }
  }
  async function onDeletePuppy(id: string) {
    if (!confirm('Delete this puppy?')) return;
    const { error } = await supabase.from('puppies').delete().eq('id', id);
    if (error) alert(error.message); else loadPuppies(puppySearchRef.current?.value || '');
  }

  // Payments
  async function onRecordPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPaymentMsg('');
    const fd = new FormData(e.currentTarget);
    const row = {
      buyer_id: (fd.get('buyer_id') as string) || null,
      puppy_id: (fd.get('puppy_id') as string) || null,
      amount: fd.get('amount') ? Number(fd.get('amount')) : null,
      method: (fd.get('method') as string) || null,
      note: (fd.get('note') as string) || null,
      paid_at: (fd.get('paid_at') as string) || null
    };
    const { error } = await supabase.from('payments').insert(row);
    setPaymentMsg(error ? error.message : 'Saved.');
    if (!error) { (e.currentTarget as HTMLFormElement).reset(); await loadPayments(); await refreshReports(); }
  }

  // Messages
  async function onSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessageMsg('');
    const fd = new FormData(e.currentTarget);
    const row = {
      buyer_id: (fd.get('buyer_id') as string) || null,
      puppy_id: (fd.get('puppy_id') as string) || null,
      body: (fd.get('body') as string) || null,
      sender: 'admin'
    };
    const { error } = await supabase.from('messages').insert(row);
    setMessageMsg(error ? error.message : 'Sent.');
    if (!error) { (e.currentTarget as HTMLFormElement).reset(); await loadMessages(); }
  }

  // Documents
  async function onUploadDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setDocMsg('');
    const fd = new FormData(e.currentTarget);
    const file = fd.get('file') as File | null;
    if (!file || !file.name) { setDocMsg('Choose a file'); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const key = `docs/${Date.now()}_${safeName}`;
    const up = await supabase.storage.from('docs').upload(key, file);
    if (up.error) { setDocMsg(up.error.message); return; }
    const row = {
      buyer_id: (fd.get('buyer_id') as string) || null,
      puppy_id: (fd.get('puppy_id') as string) || null,
      label: (fd.get('label') as string) || null,
      file_key: key,
      uploaded_at: new Date().toISOString()
    };
    const { error } = await supabase.from('documents').insert(row);
    setDocMsg(error ? error.message : 'Uploaded.');
    if (!error) { (e.currentTarget as HTMLFormElement).reset(); await loadDocuments(); }
  }

  // Transport
  async function onSaveTransport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setTransportMsg('');
    const fd = new FormData(e.currentTarget);
    const row = {
      buyer_id: (fd.get('buyer_id') as string) || null,
      puppy_id: (fd.get('puppy_id') as string) || null,
      method: (fd.get('method') as string) || null,
      city: (fd.get('city') as string) || null,
      state: (fd.get('state') as string) || null,
      date: (fd.get('date') as string) || null,
      note: (fd.get('note') as string) || null
    };
    const { error } = await supabase.from('transportations').insert(row);
    setTransportMsg(error ? error.message : 'Saved.');
    if (!error) { (e.currentTarget as HTMLFormElement).reset(); await loadTransports(); }
  }

  // Buyers
  async function onAddBuyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBuyerMsg('');
    const fd = new FormData(e.currentTarget);
    const row = {
      full_name: (fd.get('full_name') as string) || null,
      email: (fd.get('email') as string) || null,
      phone: (fd.get('phone') as string) || null,
      is_repeat: (fd.get('is_repeat') as string) === 'on'
    };
    const { error } = await supabase.from('buyers').insert(row);
    setBuyerMsg(error ? error.message : 'Buyer added.');
    if (!error) { (e.currentTarget as HTMLFormElement).reset(); await loadBuyers(); }
  }
  async function onUpdateBuyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBuyerMsg('');
    if (!editBuyer?.id) { setBuyerMsg('No buyer selected.'); return; }
    const fd = new FormData(e.currentTarget);
    const row = {
      full_name: (fd.get('full_name') as string) || null,
      email: (fd.get('email') as string) || null,
      phone: (fd.get('phone') as string) || null,
      is_repeat: (fd.get('is_repeat') as string) === 'on'
    };
    const { error } = await supabase.from('buyers').update(row).eq('id', editBuyer.id);
    setBuyerMsg(error ? error.message : 'Buyer updated.');
    if (!error) { await loadBuyers(); }
  }
  async function onDeleteBuyer(id: string) {
    if (!confirm('Delete this buyer?')) return;
    const { error } = await supabase.from('buyers').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      if (editBuyer?.id === id) setEditBuyer(null);
      await loadBuyers();
    }
  }

  /* ========== Effects ========== */
  useEffect(() => {
    const saved = (localStorage.getItem('admin_active_tab') || '') as TabKey;
    if (saved) setTab(saved);
  }, []);
  useEffect(() => { localStorage.setItem('admin_active_tab', tab); }, [tab]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? null;
        setMe(email);
        if (!email) { r.replace('/login'); return; }
        if (email.toLowerCase() !== ADMIN_EMAIL) { setBlocked(true); return; }

        await Promise.all([
          loadOverview(), loadPuppies(), loadDogs(), loadLitters(), loadApplications('all'),
          loadBuyers(), loadPayments(), loadMessages(), loadDocuments(),
          loadTransports(), refreshReports()
        ]);
      } finally { setLoadingGate(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========== Render ========== */
  if (loadingGate) {
    return (
      <main style={{ maxWidth: 900, margin: '48px auto', padding: 24 }}>
        <h1>Admin Dashboard</h1><p>Loading…</p>
      </main>
    );
  }
  if (blocked) {
    return (
      <main style={{ maxWidth: 900, margin: '48px auto', padding: 24 }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#a00' }}>Your account does not have access to this page.</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="wrap">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <div className="logo" aria-hidden />
            <h1>SWVA Chihuahua<br /><span style={{ fontWeight: 400, color: 'var(--muted)' }}>Admin Portal</span></h1>
            <span className="roleTag">Admin</span>
          </div>
          <nav className="nav">
            <h4>Manage</h4>
            {(['overview','puppies','litters','applications','buyers','payments','messages','documents','transport','reports','settings'] as TabKey[])
              .map(k => (
                <button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>
                  <span className="icon" />{titleFor(k)}
                </button>
              ))}
          </nav>
          <div className="spacer" />
          <div className="authBtns">
            <button className="btn" onClick={async()=>{
              const { data } = await supabase.auth.getUser();
              alert(data.user ? JSON.stringify({ id: data.user.id, email: data.user.email }, null, 2) : 'Not signed in');
            }}>Profile</button>
            <button className="btn" onClick={async()=>{ await supabase.auth.signOut(); location.href='/login'; }}>Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <section className="main">
          <div className="header">
            <h2>{titleFor(tab)}</h2>
            <span className="crumbs">Admin / {titleFor(tab)}</span>
          </div>

          {/* OVERVIEW */}
          {tab==='overview' && (
            <div className="grid">
              <div className="card span4"><div className="stat"><span className="dot" /><div><div className="crumbs">Active Puppies</div><div className="kpi">{String(kpiPuppies)}</div></div></div></div>
              <div className="card span4"><div className="stat"><span className="dot" style={{background:'var(--ok)'}} /><div><div className="crumbs">Approved Applications (30d)</div><div className="kpi">{String(kpiApps)}</div></div></div></div>
              <div className="card span4"><div className="stat"><span className="dot" style={{background:'var(--warn)'}} /><div><div className="crumbs">Payments (30d)</div><div className="kpi">{String(kpiPayments)}</div></div></div></div>
              <div className="card span12">
                <h3 style={{margin:0,marginBottom:8}}>Recent Activity</h3>
                <pre style={{whiteSpace:'pre-wrap',margin:0}}>{recentActivity}</pre>
              </div>
            </div>
          )}

          {/* PUPPIES */}
          {tab==='puppies' && (
            <div className="grid">
              <div className="card span6">
                <h3 style={{margin:0,marginBottom:8}}>Add Puppy</h3>
                <form onSubmit={onAddPuppy}>
                  <div className="row">
                    <div className="col6"><label>Name</label><input name="name" placeholder="Puppy Name" /></div>
                    <div className="col6"><label>Status</label><select name="status"><option>Available</option><option>Reserved</option><option>Sold</option></select></div>
                    <div className="col6"><label>DOB</label><input type="date" name="dob" /></div>
                    <div className="col6"><label>Ready Date</label><input type="date" name="ready_date" /></div>
                    <div className="col4"><label>Price ($)</label><input name="price" inputMode="decimal" /></div>
                    <div className="col4"><label>Gender</label><select name="gender"><option value="">—</option><option>Male</option><option>Female</option></select></div>
                    <div className="col4"><label>Registry</label><select name="registry"><option value="">—</option><option>AKC</option><option>CKC</option><option>ACA</option></select></div>
                    <div className="col12"><label>Photo URL (first)</label><input name="photo" placeholder="https://…" /></div>
                    <div className="col6">
                      <label>Sire</label>
                      <select name="sire_id" defaultValue="">
                        <option value="">—</option>
                        {maleDogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="col6">
                      <label>Dam</label>
                      <select name="dam_id" defaultValue="">
                        <option value="">—</option>
                        {femaleDogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Save Puppy</button>
                    <span className="crumbs">{puppyMsg}</span>
                  </div>
                </form>
              </div>
              <div className="card span6">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                  <h3 style={{margin:0}}>Puppy List</h3>
                  <div className="actions">
                    <input ref={puppySearchRef} placeholder="Search name/registry…" style={{width:220}} onChange={e=>loadPuppies(e.currentTarget.value)} />
                    <button className="btn" onClick={()=>loadPuppies(puppySearchRef.current?.value || '')}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:8}}>
                  {puppies.length===0 ? <div className="notice">No puppies found.</div> : (
                    <table>
                      <thead><tr><th>Name</th><th>DOB</th><th>Registry</th><th>Gender</th><th>Price</th><th>Status</th><th/></tr></thead>
                      <tbody>
                        {puppies.map(p=>(
                          <tr key={p.id}>
                            <td>{p.name || ''}</td>
                            <td>{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</td>
                            <td>{p.registry || '-'}</td>
                            <td>{p.gender || '-'}</td>
                            <td>{fmtMoney(p.price)}</td>
                            <td><Badge status={p.status || undefined} /></td>
                            <td><div className="actions">
                              <a className="btn" href={`/admin/puppies/${p.id}`}>Edit</a>
                              <button className="btn" onClick={()=>onDeletePuppy(p.id)}>Delete</button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LITTERS */}
          {tab==='litters' && (
            <div className="grid">
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Add Litter</h3>
                <form onSubmit={async(e)=>{ e.preventDefault(); setLitterMsg(''); const fd=new FormData(e.currentTarget);
                  const row:any={ code:fd.get('code'), dam:fd.get('dam'), sire:fd.get('sire'), whelp_date:fd.get('whelp_date'), notes:fd.get('notes') };
                  const { error } = await supabase.from('litters').insert(row);
                  setLitterMsg(error?error.message:'Saved.'); if(!error){ (e.currentTarget as HTMLFormElement).reset(); await loadLitters(); }
                }}>
                  <label>Code</label><input name="code" placeholder="2025-EMB×BUB-01" required />
                  <label>Dam</label><input name="dam" placeholder="e.g., Ember" />
                  <label>Sire</label><input name="sire" placeholder="e.g., Bubba Roe" />
                  <label>Whelp Date</label><input type="date" name="whelp_date" />
                  <label>Notes</label><textarea name="notes" rows={3} />
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Save Litter</button>
                    <span className="crumbs">{litterMsg}</span>
                  </div>
                </form>
              </div>
              <div className="card span8">
                <h3 style={{margin:0,marginBottom:8}}>Litter List</h3>
                {litters.length===0 ? <div className="notice">No litters found.</div> : (
                  <table>
                    <thead><tr><th>Code</th><th>Dam</th><th>Sire</th><th>Whelp Date</th><th>Notes</th></tr></thead>
                    <tbody>{litters.map((l:any)=>(
                      <tr key={l.id}>
                        <td>{l.code || '-'}</td><td>{l.dam || '-'}</td><td>{l.sire || '-'}</td>
                        <td>{l.whelp_date ? new Date(l.whelp_date).toLocaleDateString() : '-'}</td>
                        <td>{l.notes || ''}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* APPLICATIONS */}
          {tab==='applications' && (
            <div className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                <h3 style={{margin:0}}>Applications</h3>
                <div className="actions">
                  <select value={appFilter} onChange={async e=>{ const v=e.currentTarget.value as any; setAppFilter(v); await loadApplications(v); }}>
                    <option value="all">All</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                  <button className="btn" onClick={()=>loadApplications(appFilter)}>Refresh</button>
                </div>
              </div>
              <div style={{marginTop:8}}>
                {apps.length===0 ? <div className="notice">No applications found.</div> : (
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Submitted</th><th/></tr></thead>
                    <tbody>{apps.map(a=>(
                      <tr key={a.id}>
                        <td>{a.buyer_name || '-'}</td><td>{a.email || '-'}</td><td>{a.phone || '-'}</td>
                        <td><Badge status={a.status || 'submitted'} /></td>
                        <td>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '-'}</td>
                        <td>
                          <div className="actions">
                            <button className="btn" onClick={()=>onOpenApprove(a)}>Review / Approve</button>
                            <button className="btn" onClick={()=>denyApp(a.id)}>Deny</button>
                            {/* quick approve fallback */}
                            {/* <button className="btn" onClick={()=>approveApp(a.id)}>Quick Approve</button> */}
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* BUYERS (ADD + EDIT) */}
          {tab==='buyers' && (
            <div className="grid">
              {/* Add Buyer */}
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Add Buyer</h3>
                <form onSubmit={onAddBuyer}>
                  <label>Full Name</label><input name="full_name" placeholder="First Last" required />
                  <label>Email</label><input name="email" type="email" placeholder="name@example.com" />
                  <label>Phone</label><input name="phone" placeholder="(555) 555-5555" />
                  <label className="chk"><input type="checkbox" name="is_repeat" /> <span>Repeat Buyer</span></label>
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Save Buyer</button>
                    <span className="crumbs">{buyerMsg}</span>
                  </div>
                </form>
              </div>

              {/* Buyers List */}
              <div className="card span8">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                  <h3 style={{margin:0}}>Buyers</h3>
                  <div className="actions"><button className="btn" onClick={loadBuyers}>Refresh</button></div>
                </div>
                <div style={{marginTop:8}}>
                  {buyers.length===0 ? <div className="notice">No buyers found.</div> : (
                    <table>
                      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Repeat</th><th>Created</th><th/></tr></thead>
                      <tbody>{buyers.map(b=>(
                        <tr key={b.id}>
                          <td>{b.full_name || '-'}</td>
                          <td>{b.email || '-'}</td>
                          <td>{b.phone || '-'}</td>
                          <td>{b.is_repeat ? 'Yes' : 'No'}</td>
                          <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                          <td>
                            <div className="actions">
                              <button className="btn" onClick={()=>setEditBuyer(b)}>Edit</button>
                              <button className="btn" onClick={()=>onDeleteBuyer(b.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Edit Buyer Drawer/Card */}
              {editBuyer && (
                <div className="card span12" style={{borderColor:'var(--brand)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                    <h3 style={{margin:0}}>Edit Buyer</h3>
                    <div className="actions">
                      <button className="btn" onClick={()=>setEditBuyer(null)}>Close</button>
                    </div>
                  </div>
                  <form onSubmit={onUpdateBuyer} style={{marginTop:8,display:'grid',gap:12}}>
                    <div className="row">
                      <div className="col6">
                        <label>Full Name</label>
                        <input name="full_name" defaultValue={editBuyer.full_name || ''} required />
                      </div>
                      <div className="col6">
                        <label>Email</label>
                        <input name="email" type="email" defaultValue={editBuyer.email || ''} />
                      </div>
                      <div className="col6">
                        <label>Phone</label>
                        <input name="phone" defaultValue={editBuyer.phone || ''} />
                      </div>
                      <div className="col6" style={{display:'flex',alignItems:'flex-end'}}>
                        <label className="chk" style={{margin:0}}>
                          <input type="checkbox" name="is_repeat" defaultChecked={!!editBuyer.is_repeat} /> <span>Repeat Buyer</span>
                        </label>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="btn primary" type="submit">Update</button>
                      <button className="btn" type="button" onClick={()=>onDeleteBuyer(editBuyer.id)}>Delete</button>
                      <span className="crumbs">{buyerMsg}</span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {tab==='payments' && (
            <div className="grid">
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Record Payment</h3>
                <form onSubmit={onRecordPayment}>
                  <label>Buyer ID</label><input name="buyer_id" required />
                  <label>Puppy ID (optional)</label><input name="puppy_id" />
                  <div className="row">
                    <div className="col6"><label>Amount ($)</label><input name="amount" inputMode="decimal" required /></div>
                    <div className="col6"><label>Method</label><select name="method"><option>Zoho</option><option>PayPal</option><option>Stripe</option><option>Cash</option><option>Other</option></select></div>
                  </div>
                  <label>Note</label><input name="note" placeholder="Deposit / Balance" />
                  <label>Date</label><input type="datetime-local" name="paid_at" />
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Save Payment</button>
                    <span className="crumbs">{paymentMsg}</span>
                  </div>
                </form>
              </div>
              <div className="card span8">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                  <h3 style={{margin:0}}>Payments</h3>
                  <div className="actions">
                    <button className="btn" onClick={async()=>{ await loadPayments(); await refreshReports(); }}>Refresh</button>
                  </div>
                </div>
                <div style={{marginTop:8}}>
                  {payments.length===0 ? <div className="notice">No payments found.</div> : (
                    <table>
                      <thead><tr><th>Buyer</th><th>Puppy</th><th>Amount</th><th>Method</th><th>Date</th><th>Note</th></tr></thead>
                      <tbody>{payments.map(p=>(
                        <tr key={p.id}>
                          <td>{p.buyer_id || '-'}</td><td>{p.puppy_id || '-'}</td>
                          <td>{fmtMoney(p.amount)}</td><td>{p.method || '-'}</td>
                          <td>{p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}</td>
                          <td>{p.note || ''}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab==='messages' && (
            <div className="grid">
              <div className="card span8">
                <h3 style={{margin:0,marginBottom:8}}>Inbox</h3>
                {messages.length===0 ? <div className="notice">No messages.</div> : (
                  <div style={{display:'grid',gap:8}}>
                    {messages.map(m=>(
                      <div key={m.id} className="notice">
                        <b>{m.sender || 'buyer'}</b> • {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}<br/>{m.body || ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Reply</h3>
                <form onSubmit={onSendMessage}>
                  <label>Buyer ID</label><input name="buyer_id" required />
                  <label>Puppy ID (optional)</label><input name="puppy_id" />
                  <label>Message</label><textarea name="body" rows={5} required />
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Send Reply</button>
                    <span className="crumbs">{messageMsg}</span>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab==='documents' && (
            <div className="grid">
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Upload Document</h3>
                <form onSubmit={onUploadDoc}>
                  <label>Buyer ID (optional)</label><input name="buyer_id" />
                  <label>Puppy ID (optional)</label><input name="puppy_id" />
                  <label>Label</label><input name="label" placeholder="Bill of Sale / Health Guarantee" required />
                  <label>File</label><input type="file" name="file" accept=".pdf,.jpg,.png,.doc,.docx" required />
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Upload</button>
                    <span className="crumbs">{docMsg}</span>
                  </div>
                </form>
              </div>
              <div className="card span8">
                <h3 style={{margin:0,marginBottom:8}}>Documents</h3>
                {docs.length===0 ? <div className="notice">No documents found.</div> : (
                  <table>
                    <thead><tr><th>Label</th><th>Buyer</th><th>Puppy</th><th>File</th><th>Uploaded</th></tr></thead>
                    <tbody>{docs.map(d=>(
                      <tr key={d.id}>
                        <td>{d.label || '-'}</td><td>{(d as any).buyer_id || '-'}</td><td>{(d as any).puppy_id || '-'}</td>
                        <td><OpenDocLink supabase={supabase as any} file_key={d.file_key || ''} /></td>
                        <td>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TRANSPORT */}
          {tab==='transport' && (
            <div className="grid">
              <div className="card span4">
                <h3 style={{margin:0,marginBottom:8}}>Schedule Transport</h3>
                <form onSubmit={onSaveTransport}>
                  <label>Buyer ID</label><input name="buyer_id" required />
                  <label>Puppy ID</label><input name="puppy_id" required />
                  <label>Method</label><select name="method"><option>Pickup</option><option>Ground Delivery</option><option>Flight Nanny</option></select>
                  <div className="row">
                    <div className="col6"><label>City</label><input name="city" /></div>
                    <div className="col6"><label>State</label><input name="state" /></div>
                  </div>
                  <label>Date</label><input type="date" name="date" />
                  <label>Note</label><textarea name="note" rows={3} />
                  <div className="actions" style={{marginTop:12}}>
                    <button className="btn primary" type="submit">Save</button>
                    <span className="crumbs">{transportMsg}</span>
                  </div>
                </form>
              </div>
              <div className="card span8">
                <h3 style={{margin:0,marginBottom:8}}>Transport Requests</h3>
                {transports.length===0 ? <div className="notice">No transport requests found.</div> : (
                  <table>
                    <thead><tr><th>Buyer</th><th>Puppy</th><th>Method</th><th>City/State</th><th>Date</th><th>Note</th></tr></thead>
                    <tbody>{transports.map(t=>(
                      <tr key={t.id}>
                        <td>{t.buyer_id || '-'}</td><td>{t.puppy_id || '-'}</td><td>{t.method || '-'}</td>
                        <td>{t.city || '-'}, {t.state || '-'}</td>
                        <td>{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                        <td>{t.note || ''}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab==='reports' && (
            <div className="grid">
              <div className="card span6"><h3 style={{margin:0,marginBottom:8}}>30-Day Summary</h3><div className="notice">{reportSummary}</div></div>
              <div className="card span6"><h3 style={{margin:0,marginBottom:8}}>Top Signals</h3><ul style={{margin:0,paddingLeft:18}}>{reportSignals.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
              <div className="card span12"><h3 style={{margin:0,marginBottom:8}}>Payments by Day (ASCII)</h3><pre style={{whiteSpace:'pre-wrap',margin:0}}>{paymentsAscii}</pre></div>
            </div>
          )}

          {/* SETTINGS */}
          {tab==='settings' && (
            <div className="grid">
              <div className="card span6">
                <h3 style={{margin:0,marginBottom:8}}>Admin Access</h3>
                <div className="notice">Admin access is currently email-gated for {ADMIN_EMAIL}.</div>
              </div>
              <div className="card span6"><h3 style={{margin:0,marginBottom:8}}>Profile</h3><div className="notice">Signed in as {me}</div></div>
            </div>
          )}
        </section>
      </div>

      {/* Approve Drawer */}
      {approveOpen && activeApp && (
        <div className="drawer" role="dialog" aria-modal="true">
          <div className="drawer-panel">
            <div className="drawer-hd">
              <h2>Review & Approve</h2>
              <button className="x" onClick={()=>{ setApproveOpen(false); setActiveApp(null); }}>×</button>
            </div>
            <div className="drawer-body">
              <section className="section">
                <h3>Application</h3>
                <div className="kv">
                  <div><label>Name</label><span>{activeApp.buyer_name || '—'}</span></div>
                  <div><label>Email</label><span>{activeApp.email || '—'}</span></div>
                  <div><label>Phone</label><span>{activeApp.phone || '—'}</span></div>
                  <div><label>Status</label><span>{activeApp.status || '—'}</span></div>
                  <div><label>Submitted</label><span>{activeApp.submitted_at ? new Date(activeApp.submitted_at).toLocaleString() : '—'}</span></div>
                </div>
                {appDocUrl ? (
                  <div style={{marginTop:8}}>
                    <a className="btn" href={appDocUrl} target="_blank" rel="noreferrer">Open Application PDF</a>
                  </div>
                ) : null}
              </section>

              <section className="section">
                <h3>Assign Puppy (sets status to Reserved)</h3>
                <div className="assign">
                  <select value={selectedPupId} onChange={e=>setSelectedPupId(e.target.value)}>
                    <option value="">— Select an Available puppy —</option>
                    {availablePups.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name || 'Unnamed'} • {p.gender || '—'} • {p.registry || '—'} • {fmtMoney(p.price)}
                      </option>
                    ))}
                  </select>
                  <button className="btn primary" disabled={!selectedPupId || approving} onClick={approveAndAssign}>
                    {approving ? 'Approving…' : 'Approve & Assign'}
                  </button>
                </div>
                {approveMsg && <div className="notice" style={{marginTop:10}}>{approveMsg}</div>}
                <p className="crumbs" style={{marginTop:8}}>
                  This will set the puppy’s status to <b>Reserved</b> and mark the application <b>approved</b>.
                </p>
              </section>
            </div>
          </div>
          <div className="scrim" onClick={()=>{ setApproveOpen(false); setActiveApp(null); }} />
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        :root{
          --bg:#f7f5f1; --ink:#2e2a24; --muted:#6f6257; --panel:#fff; --panelAlt:#f2ede7;
          --brand:#b5835a; --ok:#2fa36b; --warn:#d28512; --danger:#c63737; --ring:rgba(181,131,90,.25);
        }
        html,body{height:100%;margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--ink)}
        .wrap{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
        .sidebar{background:#fff;border-right:1px solid #e7e0d9;position:sticky;top:0;height:100vh;display:flex;flex-direction:column}
        .brand{display:flex;align-items:center;gap:10px;padding:18px 16px;border-bottom:1px solid #eee}
        .brand .logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(145deg,#b5835a,#9a6c49);box-shadow:inset 0 0 0 4px #fff}
        .brand h1{font-size:1.05rem;margin:0;line-height:1.1}
        .roleTag{font-size:.72rem;color:#fff;background:var(--brand);padding:2px 6px;border-radius:999px;margin-left:auto}
        .nav{padding:10px}
        .nav h4{margin:14px 10px 6px;font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
        .nav button{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;margin:4px 0;border:0;background:transparent;border-radius:10px;color:var(--ink);cursor:pointer}
        .nav button:hover{background:var(--panelAlt)}
        .nav button.active{background:var(--brand);color:#fff}
        .nav .icon{width:18px;height:18px;border-radius:4px;background:var(--brand);opacity:.15}
        .spacer{flex:1}
        .authBtns{padding:12px;border-top:1px solid #eee;display:flex;gap:8px}
        .btn{appearance:none;border:1px solid #e0d8d0;background:#fff;color:var(--ink);padding:8px 10px;border-radius:10px;cursor:pointer;text-decoration:none}
        .btn.primary{background:var(--brand);border-color:var(--brand);color:#fff}
        .main{padding:22px;min-height:100vh}
        .header{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px}
        .header h2{margin:0;font-size:1.4rem}
        .crumbs{color:var(--muted);font-size:.9rem}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
        .card{grid-column:span 12;background:var(--panel);border:1px solid #e7e0d9;border-radius:14px;padding:16px}
        @media (min-width:900px){
          .span4{grid-column:span 4}.span6{grid-column:span 6}.span8{grid-column:span 8}.span12{grid-column:span 12}
          .col6{grid-column:span 6}.col4{grid-column:span 4}.col12{grid-column:span 12}
        }
        .row .col6,.row .col4,.row .col12{grid-column:span 12}
        table{width:100%;border-collapse:separate;border-spacing:0 8px}
        thead th{font-size:.85rem;color:var(--muted);text-align:left;padding:8px 10px}
        tbody td{background:#fff;padding:10px;border-top:1px solid #eee;border-bottom:1px solid #eee}
        tbody tr td:first-child{border-left:1px solid #eee;border-top-left-radius:8px;border-bottom-left-radius:8px}
        tbody tr td:last-child{border-right:1px solid #eee;border-top-right-radius:8px;border-bottom-right-radius:8px}
        label{display:block;font-size:.9rem;margin:10px 0 6px}
        input,select,textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;background:#fff;outline:0}
        input:focus,select:focus,textarea:focus{border-color:var(--brand);box-shadow:0 0 0 4px var(--ring)}
        .row{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
        .actions{display:flex;gap:8px;flex-wrap:wrap}
        .chk{display:flex;align-items:center;gap:8px}
        .badge{display:inline-block;padding:4px 8px;border-radius:999px;font-size:.8rem}
        .badge.ok{background:rgba(47,163,107,.12);color:#1f6b47}
        .badge.warn{background:rgba(210,133,18,.12);color:#6f470e}
        .badge.danger{background:rgba(198,55,55,.12);color:#7a2222}
        .notice{padding:10px 12px;border-left:4px solid var(--brand);background:#fff;border:1px solid #eee;border-radius:8px;margin:8px 0}
        .stat{display:flex;align-items:center;gap:12px}
        .dot{width:10px;height:10px;border-radius:50%;background:var(--brand)}
        .kpi{font-size:1.6rem;font-weight:700}

        /* Drawer */
        .drawer{position:fixed;inset:0;display:flex;justify-content:flex-end;z-index:60}
        .scrim{position:absolute;inset:0;background:rgba(0,0,0,.25)}
        .drawer-panel{position:relative;width:min(600px,95vw);height:100%;background:#fff;border-left:1px solid #e8ded2;box-shadow:-8px 0 24px rgba(0,0,0,.08);display:flex;flex-direction:column}
        .drawer-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #f0e6da}
        .x{font-size:22px;line-height:1;border:0;background:transparent;cursor:pointer;padding:4px 8px}
        .drawer-body{padding:12px 14px;overflow:auto}
        .section{margin-bottom:16px}
        .section h3{margin:0 0 8px}
        .kv{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 14px}
        .kv label{display:block;font-size:.85rem;color:var(--muted)}
        .kv span{display:block}
        .assign{display:flex;gap:10px;align-items:center}
        .assign select{flex:1;min-width:220px;padding:8px 10px;border:1px solid #e3d6c9;border-radius:10px}
      `}</style>
    </main>
  );
}

/* ========== Small Pieces ========== */
function OpenDocLink({ supabase, file_key }: { supabase: any; file_key: string }) {
  const [url, setUrl] = useState<string>('#');
  useEffect(() => { (async () => {
    if (!file_key) return;
    const { data } = await supabase.storage.from('docs').getPublicUrl(file_key);
    setUrl(data?.publicUrl || '#');
  })(); }, [file_key, supabase]);
  return <a href={url} target="_blank" rel="noreferrer" className="btn">Open</a>;
}
