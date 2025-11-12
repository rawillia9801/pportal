'use client';

/* ============================================
   CHANGELOG
   - 2025-11-12: New customer "My Puppy Portal" page
     * Left title: "My Puppy" (line break) "Portal" centered
     * Tabs: Available Puppies, My Puppy, Documents, Payments,
             Transportation, Message, Profile
     * Landing hero: "Welcome to My Puppy Portal" + Signup + Description
     * Quick cards: Application to Adopt, Financing Options, FAQ, Support
     * Available Puppies: Litters (Available) + (Past), cards sorted by date & dam
     * My Puppy: photo, DOB, weights, milestones, socialization, week 1–8 fun facts
     * Documents: Application PDF, ToS, Hypoglycemia, Deposit, Bill of Sale,
                  Transport, Health Guarantee (from docs bucket)
     * Payments: Apply for Financing, Pay Deposit, Make Payment + timeline/summary
     * Transportation: schedule request form (writes to transportations)
     * Message: simple 2-way chat (buyer↔admin) in messages table
     * Profile: update buyer record (name/phone) based on auth email
   ============================================ */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

type TabKey =
  | 'available'
  | 'mypuppy'
  | 'documents'
  | 'payments'
  | 'transportation'
  | 'message'
  | 'profile';

const NL = String.fromCharCode(10);

type Dog = { id: string; name: string; sex: 'Male' | 'Female'; active?: boolean | null };
type Litter = { id: string; code: string | null; dam_id?: string | null; sire_id?: string | null; whelp_date?: string | null; notes?: string | null };
type Puppy = {
  id: string;
  name: string | null;
  price: number | null;
  status: 'Available' | 'Reserved' | 'Sold' | null;
  gender: 'Male' | 'Female' | null;
  registry: 'AKC' | 'CKC' | 'ACA' | null;
  dob: string | null;
  ready_date: string | null;
  photos: string[] | null;
  sire_id: string | null;
  dam_id: string | null;
  litter_id?: string | null;
};
type Buyer = { id: string; full_name: string | null; email: string | null; phone: string | null; created_at?: string | null };
type BuyerPuppy = { id: string; buyer_id: string; puppy_id: string; created_at?: string | null; puppy?: Puppy };
type DocRow = { id: string; buyer_id?: string | null; puppy_id?: string | null; label?: string | null; file_key: string | null; uploaded_at?: string | null };
type Payment = { id: string; buyer_id: string | null; puppy_id: string | null; amount: number | null; method: string | null; note: string | null; paid_at: string | null };
type MessageRow = { id: string; buyer_id: string | null; puppy_id: string | null; sender: string | null; body: string | null; created_at: string | null };
type WeightRow = { id: string; puppy_id: string; week_num: number; weight_oz: number; recorded_at?: string | null };
type Milestone = { id: string; puppy_id: string; key: string; date: string | null; notes?: string | null };

export default function MyPuppyPortalPage() {
  const supabase = getBrowserClient();

  /* ========== Auth / Buyer linkage ========== */
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMsg, setAuthMsg] = useState('');

  /* ========== Tabs ========== */
  const [tab, setTab] = useState<TabKey>('available');
  useEffect(() => {
    const saved = (localStorage.getItem('portal_active_tab') || '') as TabKey;
    if (saved) setTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('portal_active_tab', tab);
  }, [tab]);

  /* ========== Shared lookup data ========== */
  const [dogs, setDogs] = useState<Dog[]>([]);
  const damName = useMemo(() => {
    const m = new Map<string, string>();
    dogs.filter(d => d.sex === 'Female').forEach(d => m.set(d.id, d.name));
    return m;
  }, [dogs]);
  const sireName = useMemo(() => {
    const m = new Map<string, string>();
    dogs.filter(d => d.sex === 'Male').forEach(d => m.set(d.id, d.name));
    return m;
  }, [dogs]);

  /* ========== Available Puppies tab ========== */
  const [litters, setLitters] = useState<Litter[]>([]);
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [availableLitters, setAvailableLitters] = useState<Litter[]>([]);
  const [pastLitters, setPastLitters] = useState<Litter[]>([]);
  const [landingOpen, setLandingOpen] = useState(true); // show hero + signup area atop Available tab when signed-out

  /* ========== My Puppy tab ========== */
  const [myPuppies, setMyPuppies] = useState<BuyerPuppy[]>([]);
  const [weights, setWeights] = useState<Record<string, WeightRow[]>>({});
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});

  /* ========== Documents tab ========== */
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [docMsg, setDocMsg] = useState('');

  /* ========== Payments tab ========== */
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMsg, setPaymentMsg] = useState('');
  const [intentMsg, setIntentMsg] = useState('');

  /* ========== Transportation tab ========== */
  const [transportMsg, setTransportMsg] = useState('');

  /* ========== Message tab ========== */
  const [chat, setChat] = useState<MessageRow[]>([]);
  const [chatBody, setChatBody] = useState('');
  const chatTimerRef = useRef<any>(null);

  /* ========== Profile tab ========== */
  const [profileMsg, setProfileMsg] = useState('');

  /* ========== Helpers ========== */
  function fmtMoney(n: number | null | undefined) {
    if (n == null || Number.isNaN(n)) return '$0.00';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function daysBetween(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
  }
  function weekNumberFromDob(dob?: string | null) {
    if (!dob) return null;
    const d = new Date(dob);
    const now = new Date();
    const days = daysBetween(d, now);
    if (days < 0) return 0;
    return Math.min(8, Math.max(1, Math.floor(days / 7) + 1));
  }
  function funFactForWeek(w?: number | null) {
    const m: Record<number, string> = {
      1: 'Newborn phase: sleeping + nursing. Handle gently; keep warm.',
      2: 'Eyes may begin to open; limited vision. Short, quiet handling only.',
      3: 'Hearing improves; first wobbly steps. Start gentle social sounds.',
      4: 'Play begins; tooth buds appear. Short supervised play bursts.',
      5: 'Exploring more; weaning may start. Introduce soft textures.',
      6: 'Coordination improving; short crate intro possible.',
      7: 'Socialization window in full swing—novel sights and gentle handling.',
      8: 'Ready for new home; reinforce potty spots and calm car rides.'
    };
    return w ? (m[w] || '') : '';
  }

  /* ========== Auth bootstrap ========== */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? null;
        setUserEmail(email);
        if (email) {
          // Ensure buyer row exists / fetch it
          const { data: existing } = await supabase
            .from('buyers')
            .select('*')
            .eq('email', email)
            .limit(1)
            .maybeSingle();

          if (existing) setBuyer(existing as Buyer);
          else {
            const { data: created, error } = await supabase
              .from('buyers')
              .insert({ email })
              .select('*')
              .single();
            if (!error && created) setBuyer(created as Buyer);
          }
        }
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [supabase]);

  /* ========== Shared lookups ========== */
  useEffect(() => {
    (async () => {
      const { data: d } = await supabase.from('dogs').select('id,name,sex,active').eq('active', true);
      setDogs((d as Dog[]) || []);
    })();
  }, [supabase]);

  /* ========== Load Available Puppies view data ========== */
  useEffect(() => {
    (async () => {
      const [{ data: lits }, { data: pups }] = await Promise.all([
        supabase.from('litters').select('*').order('whelp_date', { ascending: false }),
        supabase.from('puppies').select('id,name,status,litter_id,gender,registry,price,photos').order('created_at', { ascending: false })
      ]);
      const L = (lits as Litter[]) || [];
      const P = (pups as Puppy[]) || [];
      setLitters(L);
      setPuppies(P);

      // Determine "Available" vs "Past" litters by whether any puppy is Available
      const avail: Litter[] = [];
      const past: Litter[] = [];
      for (const l of L) {
        const pupsOfL = P.filter(p => p.litter_id === l.id);
        const anyAvail = pupsOfL.some(p => p.status === 'Available');
        if (anyAvail) avail.push(l); else past.push(l);
      }

      // Sort by date desc, then dam name asc
      const sortFn = (a: Litter, b: Litter) => {
        const da = a.whelp_date ? new Date(a.whelp_date).getTime() : 0;
        const db = b.whelp_date ? new Date(b.whelp_date).getTime() : 0;
        if (db !== da) return db - da;
        const aDam = damName.get(a.dam_id || '') || '';
        const bDam = damName.get(b.dam_id || '') || '';
        return aDam.localeCompare(bDam);
      };
      setAvailableLitters(avail.sort(sortFn));
      setPastLitters(past.sort(sortFn));
    })();
  }, [supabase, damName]);

  /* ========== Load My Puppy (assigned) ========== */
  useEffect(() => {
    (async () => {
      if (!buyer?.id) { setMyPuppies([]); return; }
      const { data, error } = await supabase
        .from('buyer_puppies')
        .select('id,buyer_id,puppy_id,created_at,puppy:puppies(id,name,gender,registry,price,dob,photos,litter_id)')
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });
      if (!error) setMyPuppies((data as any as BuyerPuppy[]) || []);

      // Load weights and milestones for each puppy
      const byId: Record<string, WeightRow[]> = {};
      const msById: Record<string, Milestone[]> = {};
      for (const bp of (data as any as BuyerPuppy[]) || []) {
        if (!bp.puppy_id) continue;
        const [w, m] = await Promise.all([
          supabase.from('puppy_weights').select('*').eq('puppy_id', bp.puppy_id).order('week_num', { ascending: true }),
          supabase.from('puppy_milestones').select('*').eq('puppy_id', bp.puppy_id).order('date', { ascending: true })
        ]);
        byId[bp.puppy_id] = (w.data as WeightRow[]) || [];
        msById[bp.puppy_id] = (m.data as Milestone[]) || [];
      }
      setWeights(byId);
      setMilestones(msById);
    })();
  }, [supabase, buyer?.id]);

  /* ========== Load Documents ========== */
  useEffect(() => {
    (async () => {
      if (!buyer?.id) { setDocs([]); return; }
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('buyer_id', buyer.id)
        .order('uploaded_at', { ascending: false });
      setDocs((data as DocRow[]) || []);
    })();
  }, [supabase, buyer?.id]);

  /* ========== Load Payments ========== */
  useEffect(() => {
    (async () => {
      if (!buyer?.id) { setPayments([]); return; }
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('buyer_id', buyer.id)
        .order('paid_at', { ascending: false });
      setPayments((data as Payment[]) || []);
    })();
  }, [supabase, buyer?.id]);

  /* ========== Load/stream Chat ========== */
  useEffect(() => {
    (async () => {
      if (!buyer?.id) { setChat([]); return; }
      const load = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('buyer_id', buyer.id)
          .order('created_at', { ascending: true })
          .limit(200);
        setChat((data as MessageRow[]) || []);
      };
      await load();
      if (chatTimerRef.current) clearInterval(chatTimerRef.current);
      chatTimerRef.current = setInterval(load, 3500);
    })();
    return () => { if (chatTimerRef.current) clearInterval(chatTimerRef.current); };
  }, [supabase, buyer?.id]);

  /* ========== Actions ========== */

  // ANCHOR: AUTH_SIGNUP
  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthMsg('');
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string)?.trim();
    const password = (fd.get('password') as string) || '';
    if (!email || !password) { setAuthMsg('Enter email and password.'); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    setAuthMsg(error ? error.message : 'Check your email to confirm your account.');
    if (!error) (e.currentTarget as HTMLFormElement).reset();
  }

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthMsg('');
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string)?.trim();
    const password = (fd.get('password') as string) || '';
    if (!email || !password) { setAuthMsg('Enter email and password.'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthMsg(error ? error.message : 'Signed in.');
    if (!error) location.reload();
  }

  function toPublicUrl(key: string): string {
    try {
      const { data } = supabase.storage.from('docs').getPublicUrl(key);
      return data?.publicUrl ?? '';
    } catch { return ''; }
  }

  // ANCHOR: REQUEST_PAYMENT_LINK
  async function onRequestPaymentIntent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentMsg('');
    if (!buyer?.id) { setIntentMsg('Please sign in first.'); return; }
    const fd = new FormData(e.currentTarget);
    const purpose = (fd.get('purpose') as string) || 'Payment';
    const amount = fd.get('amount') ? Number(fd.get('amount')) : null;
    if (!amount || amount <= 0) { setIntentMsg('Enter a valid amount.'); return; }
    // creates a record for admin to generate a checkout link
    const { error } = await supabase.from('payment_requests').insert({
      buyer_id: buyer.id,
      purpose,
      amount
    });
    setIntentMsg(error ? error.message : 'Request submitted. We will send your secure payment link.');
    if (!error) (e.currentTarget as HTMLFormElement).reset();
  }

  // ANCHOR: TRANSPORT_REQUEST
  async function onTransportRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTransportMsg('');
    if (!buyer?.id) { setTransportMsg('Please sign in first.'); return; }
    const fd = new FormData(e.currentTarget);
    const row = {
      buyer_id: buyer.id,
      puppy_id: (fd.get('puppy_id') as string) || null,
      method: (fd.get('method') as string) || null,
      city: (fd.get('city') as string) || null,
      state: (fd.get('state') as string) || null,
      date: (fd.get('date') as string) || null,
      miles: fd.get('miles') ? Number(fd.get('miles')) : null,
      gas_cost: fd.get('gas_cost') ? Number(fd.get('gas_cost')) : null,
      tolls_cost: fd.get('tolls_cost') ? Number(fd.get('tolls_cost')) : null,
      hotel_cost: fd.get('hotel_cost') ? Number(fd.get('hotel_cost')) : null,
      other_cost: fd.get('other_cost') ? Number(fd.get('other_cost')) : null,
      note: (fd.get('note') as string) || null
    };
    const { error } = await supabase.from('transportations').insert(row);
    setTransportMsg(error ? error.message : 'Request submitted. We will be in touch to confirm details.');
    if (!error) (e.currentTarget as HTMLFormElement).reset();
  }

  // ANCHOR: SEND_CHAT
  async function onSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!buyer?.id) return;
    const body = chatBody.trim();
    if (!body) return;
    const { error } = await supabase
      .from('messages')
      .insert({ buyer_id: buyer.id, body, sender: 'buyer' });
    if (!error) setChatBody('');
  }

  // ANCHOR: PROFILE_UPDATE
  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg('');
    if (!buyer?.id) { setProfileMsg('Please sign in first.'); return; }
    const fd = new FormData(e.currentTarget);
    const row = {
      full_name: (fd.get('full_name') as string) || null,
      phone: (fd.get('phone') as string) || null
    };
    const { error, data } = await supabase.from('buyers').update(row).eq('id', buyer.id).select('*').single();
    setProfileMsg(error ? error.message : 'Saved.');
    if (!error && data) setBuyer(data as Buyer);
  }

  /* ========== Computations ========== */

  // Adult weight projection (very simple: if week 8 exists, x2; else use last week * factor)
  function projectAdultWeightOz(ws: WeightRow[]) {
    if (!ws?.length) return null;
    const w8 = ws.find(w => w.week_num === 8)?.weight_oz;
    if (w8) return Math.round(w8 * 2); // placeholder rule-of-thumb
    const last = ws[ws.length - 1];
    if (!last) return null;
    const factor = last.week_num >= 6 ? 2.2 : 2.5; // conservative estimate
    return Math.round(last.weight_oz * factor);
  }

  function titleFor(t: TabKey) {
    return ({
      available: 'Available Puppies',
      mypuppy: 'My Puppy',
      documents: 'Documents',
      payments: 'Payments',
      transportation: 'Transportation',
      message: 'Message',
      profile: 'Profile'
    } as const)[t];
  }

  /* ========== Render ========== */
  return (
    <main className="portal">
      <div className="wrap">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <div className="crest" aria-hidden />
            <h1 className="brandTitle">
              <span>My Puppy</span>
              <span>Portal</span>
            </h1>
          </div>
          <nav className="nav">
            {(['available','mypuppy','documents','payments','transportation','message','profile'] as TabKey[]).map(k=>(
              <button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>
                <span className="dot" />{titleFor(k)}
              </button>
            ))}
          </nav>
          <div className="spacer" />
          <div className="authBox">
            {userEmail ? (
              <>
                <div className="crumbs">Signed in as</div>
                <div className="email">{userEmail}</div>
                <button className="btn" onClick={async()=>{ await supabase.auth.signOut(); location.reload(); }}>Sign Out</button>
              </>
            ) : (
              <>
                <div className="crumbs">Not signed in</div>
                <details>
                  <summary>Sign In</summary>
                  <form onSubmit={onSignIn} className="miniForm">
                    <input name="email" type="email" placeholder="Email" />
                    <input name="password" type="password" placeholder="Password" />
                    <button className="btn">Sign In</button>
                  </form>
                </details>
              </>
            )}
          </div>
        </aside>

        {/* Main */}
        <section className="main">
          <div className="header">
            <h2>{titleFor(tab)}</h2>
            <span className="crumbs">Customer / {titleFor(tab)}</span>
          </div>

          {/* AVAILABLE PUPPIES (with landing hero + signup for guests) */}
          {tab==='available' && (
            <div className="grid">
              {!userEmail && landingOpen && (
                <div className="card span12" style={{borderColor:'var(--brand)'}}>
                  <h3 style={{margin:'4px 0 10px'}}>Welcome to My Puppy Portal</h3>

                  {/* Signup */}
                  <form onSubmit={onSignup} className="signup">
                    <div className="row">
                      <div className="col6"><input name="email" type="email" placeholder="Email address" required /></div>
                      <div className="col4"><input name="password" type="password" placeholder="Create password" required /></div>
                      <div className="col2"><button className="btn primary" type="submit">Sign Up</button></div>
                    </div>
                    <div className="crumbs">{authMsg}</div>
                  </form>

                  {/* Description */}
                  <p className="lead" style={{marginTop:8}}>
                    This portal is your one place to browse available litters, follow your puppy’s weekly progress,
                    access and sign documents, make payments, arrange transportation, message our team, and keep your
                    contact information up to date. Create an account to unlock your personalized dashboard.
                  </p>

                  {/* Quick Cards */}
                  <div className="quickGrid">
                    <a className="qcard" href="/application" title="Application to Adopt">
                      <div className="qtitle">Application to Adopt</div>
                      <div className="qsub">Start your adoption request</div>
                    </a>
                    <a className="qcard" href="/financing" title="Financing Options">
                      <div className="qtitle">Financing Options</div>
                      <div className="qsub">Learn about payment plans</div>
                    </a>
                    <a className="qcard" href="/faq" title="Frequently Asked Questions">
                      <div className="qtitle">Frequently Asked Questions</div>
                      <div className="qsub">Answers to common questions</div>
                    </a>
                    <a className="qcard" href="/support" title="Support">
                      <div className="qtitle">Support</div>
                      <div className="qsub">We’re here to help</div>
                    </a>
                  </div>
                </div>
              )}

              <div className="card span12">
                <h3 style={{margin:0, marginBottom:8}}>Litters (Available)</h3>
                {availableLitters.length===0 ? (
                  <div className="notice">No available litters at this time.</div>
                ) : (
                  <div className="cardList">
                    {availableLitters.map(l => {
                      const pupsOfL = puppies.filter(p => p.litter_id === l.id);
                      const counts = {
                        avail: pupsOfL.filter(p => p.status==='Available').length,
                        res: pupsOfL.filter(p => p.status==='Reserved').length,
                        sold: pupsOfL.filter(p => p.status==='Sold').length
                      };
                      return (
                        <div key={l.id} className="litterCard">
                          <div className="lhd">
                            <div className="lcode">{l.code || 'Litter'}</div>
                            <div className="ldate">{l.whelp_date ? new Date(l.whelp_date).toLocaleDateString() : '-'}</div>
                          </div>
                          <div className="lrow">
                            <div><b>Dam:</b> {damName.get(l.dam_id || '') || '—'}</div>
                            <div><b>Sire:</b> {sireName.get(l.sire_id || '') || '—'}</div>
                          </div>
                          <div className="lrow">
                            <div className="chips">
                              <span className="chip ok">Available: {counts.avail}</span>
                              <span className="chip warn">Reserved: {counts.res}</span>
                              <span className="chip danger">Sold: {counts.sold}</span>
                            </div>
                          </div>
                          {pupsOfL.length>0 && (
                            <details>
                              <summary>View puppies</summary>
                              <div className="plist">
                                {pupsOfL.map(p=>(
                                  <div key={p.id} className="pitem">
                                    <div className="pimg" style={{backgroundImage:`url(${(p.photos?.[0])||''})`}} />
                                    <div className="pmeta">
                                      <div className="pname">{p.name || 'Unnamed'}</div>
                                      <div className="prow">{p.gender || '—'} • {p.registry || '—'} • {fmtMoney(p.price)}</div>
                                      <div className="prow"><b>Status:</b> {p.status || '-'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card span12">
                <h3 style={{margin:0, marginBottom:8}}>Litters (Past)</h3>
                {pastLitters.length===0 ? (
                  <div className="notice">No past litters to show.</div>
                ) : (
                  <div className="cardList">
                    {pastLitters.map(l => (
                      <div key={l.id} className="litterCard">
                        <div className="lhd">
                          <div className="lcode">{l.code || 'Litter'}</div>
                          <div className="ldate">{l.whelp_date ? new Date(l.whelp_date).toLocaleDateString() : '-'}</div>
                        </div>
                        <div className="lrow">
                          <div><b>Dam:</b> {damName.get(l.dam_id || '') || '—'}</div>
                          <div><b>Sire:</b> {sireName.get(l.sire_id || '') || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY PUPPY */}
          {tab==='mypuppy' && (
            <div className="grid">
              {authLoading ? (
                <div className="card span12"><div className="notice">Loading…</div></div>
              ) : !userEmail ? (
                <div className="card span12"><div className="notice">Please sign in to view your puppy dashboard.</div></div>
              ) : myPuppies.length===0 ? (
                <div className="card span12"><div className="notice">No puppy assigned yet.</div></div>
              ) : (
                myPuppies.map(bp => {
                  const p = bp.puppy!;
                  const ws = weights[p.id] || [];
                  const proj = projectAdultWeightOz(ws);
                  const week = weekNumberFromDob(p.dob);
                  const ms = milestones[p.id] || [];
                  return (
                    <div key={bp.id} className="card span12">
                      <div className="row">
                        <div className="col4">
                          <div className="heroImg" style={{backgroundImage:`url(${(p.photos?.[0])||''})`}} />
                        </div>
                        <div className="col8">
                          <h3 style={{marginTop:0}}>{p.name || 'Your Puppy'}</h3>
                          <div className="kv">
                            <div><label>DOB</label><span>{p.dob ? new Date(p.dob).toLocaleDateString() : '-'}</span></div>
                            <div><label>Registry</label><span>{p.registry || '—'}</span></div>
                            <div><label>Gender</label><span>{p.gender || '—'}</span></div>
                            <div><label>Projected Adult Weight</label><span>{proj ? `${Math.round(proj/16*10)/10} lbs (${proj} oz)` : '—'}</span></div>
                          </div>

                          <div className="subsection">
                            <h4>Weekly Weight</h4>
                            {ws.length===0 ? <div className="notice">No weight entries yet.</div> : (
                              <div className="weightList">
                                {ws.map(w=>(
                                  <div key={w.id} className="wrow">
                                    <div>Week {w.week_num}</div>
                                    <div>{w.weight_oz} oz</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="crumbs" style={{marginTop:6}}>
                              Note: early weights are not reliable predictors until pups begin walking.
                            </div>
                          </div>

                          <div className="subsection">
                            <h4>Milestones</h4>
                            {ms.length===0 ? <div className="notice">No milestones recorded yet.</div> : (
                              <ul className="mlist">
                                {ms.map(m=>(
                                  <li key={m.id}><b>{m.key}</b> — {m.date ? new Date(m.date).toLocaleDateString() : '—'} {m.notes ? `• ${m.notes}` : ''}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="subsection">
                            <h4>Socialization Milestones</h4>
                            <div className="notice">Short, positive exposures to gentle sounds, clean surfaces, and calm handling build confidence.</div>
                          </div>

                          <div className="subsection">
                            <h4>Week-Appropriate Fun Fact</h4>
                            <div className="notice">{funFactForWeek(week)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {tab==='documents' && (
            <div className="grid">
              {!userEmail ? (
                <div className="card span12"><div className="notice">Sign in to view your documents.</div></div>
              ) : (
                <div className="card span12">
                  <h3 style={{marginTop:0}}>Your Documents</h3>
                  {docs.length===0 ? (
                    <div className="notice">We’ll post your documents here once available (Application, Terms of Service, Hypoglycemia Awareness, Deposit Agreement, Bill of Sale, Transportation Agreement, Health Care Guarantee).</div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Label</th><th>File</th><th>Uploaded</th></tr></thead>
                      <tbody>
                        {docs.map(d=>(
                          <tr key={d.id}>
                            <td>{d.label || '-'}</td>
                            <td><a className="btn" href={toPublicUrl(d.file_key || '')} target="_blank" rel="noreferrer">Open</a></td>
                            <td>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="crumbs">{docMsg}</div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {tab==='payments' && (
            <div className="grid">
              <div className="card span12">
                <h3 style={{marginTop:0}}>Make a Payment</h3>
                {!userEmail ? (
                  <div className="notice">Sign in to access payment options.</div>
                ) : (
                  <>
                    <div className="quickGrid">
                      <a className="qcard" href="/financing" title="Apply for Financing">
                        <div className="qtitle">Apply for Financing</div>
                        <div className="qsub">Request a payment plan</div>
                      </a>
                      <a className="qcard" href="/deposit" title="Pay Deposit">
                        <div className="qtitle">Pay Deposit</div>
                        <div className="qsub">Secure your puppy</div>
                      </a>
                      <a className="qcard" href="/pay" title="Make Payment">
                        <div className="qtitle">Make Payment</div>
                        <div className="qsub">Pay remaining balance</div>
                      </a>
                    </div>

                    <form onSubmit={onRequestPaymentIntent} className="miniForm" style={{marginTop:12}}>
                      <select name="purpose" defaultValue="Payment">
                        <option>Payment</option>
                        <option>Deposit</option>
                        <option>Balance</option>
                      </select>
                      <input name="amount" inputMode="decimal" placeholder="Amount (USD)" />
                      <button className="btn">Request Secure Link</button>
                      <span className="crumbs">{intentMsg}</span>
                    </form>

                    <div className="subsection">
                      <h4>Payment History</h4>
                      {payments.length===0 ? (
                        <div className="notice">No payments recorded yet.</div>
                      ) : (
                        <table className="table">
                          <thead><tr><th>Amount</th><th>Method</th><th>Note</th><th>Date</th></tr></thead>
                          <tbody>
                            {payments.map(p=>(
                              <tr key={p.id}>
                                <td>{fmtMoney(p.amount)}</td>
                                <td>{p.method || '—'}</td>
                                <td>{p.note || ''}</td>
                                <td>{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <div className="crumbs" style={{marginTop:6}}>
                        Total paid: {fmtMoney(payments.reduce((s,p)=>s+(Number(p.amount)||0),0))}
                      </div>
                    </div>
                  </>
                )}
                <div className="crumbs">{paymentMsg}</div>
              </div>
            </div>
          )}

          {/* TRANSPORTATION */}
          {tab==='transportation' && (
            <div className="grid">
              {!userEmail ? (
                <div className="card span12"><div className="notice">Sign in to schedule transportation.</div></div>
              ) : (
                <div className="card span12">
                  <h3 style={{marginTop:0}}>Schedule Transportation</h3>
                  <form onSubmit={onTransportRequest}>
                    <div className="row">
                      <div className="col3">
                        <label>Method</label>
                        <select name="method">
                          <option>Pickup</option>
                          <option>Ground Delivery</option>
                          <option>Flight Nanny</option>
                        </select>
                      </div>
                      <div className="col3">
                        <label>Puppy ID (optional)</label>
                        <input name="puppy_id" />
                      </div>
                      <div className="col3">
                        <label>Date</label>
                        <input type="date" name="date" />
                      </div>
                      <div className="col3">
                        <label>City</label>
                        <input name="city" />
                      </div>
                      <div className="col3">
                        <label>State</label>
                        <input name="state" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col3"><label>Miles</label><input name="miles" inputMode="numeric" /></div>
                      <div className="col3"><label>Gas ($)</label><input name="gas_cost" inputMode="decimal" /></div>
                      <div className="col3"><label>Tolls ($)</label><input name="tolls_cost" inputMode="decimal" /></div>
                      <div className="col3"><label>Hotel ($)</label><input name="hotel_cost" inputMode="decimal" /></div>
                    </div>
                    <label>Other Cost ($)</label><input name="other_cost" inputMode="decimal" />
                    <label>Notes</label><textarea name="note" rows={3} />
                    <div className="actions" style={{marginTop:12}}>
                      <button className="btn primary" type="submit">Submit Request</button>
                      <span className="crumbs">{transportMsg}</span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* MESSAGE */}
          {tab==='message' && (
            <div className="grid">
              {!userEmail ? (
                <div className="card span12"><div className="notice">Sign in to message our team.</div></div>
              ) : (
                <div className="card span12">
                  <h3 style={{marginTop:0}}>Messages</h3>
                  <div className="chatBox">
                    {chat.length===0 ? <div className="notice">No messages yet.</div> : (
                      chat.map(m=>(
                        <div key={m.id} className={`bubble ${m.sender==='buyer'?'me':'them'}`}>
                          <div className="meta">{m.sender || 'buyer'} • {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</div>
                          <div className="text">{m.body || ''}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={onSendMessage} className="chatForm">
                    <input
                      value={chatBody}
                      onChange={e=>setChatBody(e.target.value)}
                      placeholder="Type your message…"
                    />
                    <button className="btn primary">Send</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {tab==='profile' && (
            <div className="grid">
              {!userEmail ? (
                <div className="card span12"><div className="notice">Sign in to edit your profile.</div></div>
              ) : (
                <div className="card span8">
                  <h3 style={{marginTop:0}}>Profile</h3>
                  <form onSubmit={onSaveProfile}>
                    <label>Full Name</label>
                    <input name="full_name" defaultValue={buyer?.full_name || ''} />
                    <label>Phone</label>
                    <input name="phone" defaultValue={buyer?.phone || ''} />
                    <div className="actions" style={{marginTop:12}}>
                      <button className="btn primary" type="submit">Save</button>
                      <span className="crumbs">{profileMsg}</span>
                    </div>
                  </form>
                  <div className="notice" style={{marginTop:12}}>
                    Account Email: <b>{userEmail}</b><br/>
                    To change your email, contact the breeder so we can keep your records aligned.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Styles */}
      <style jsx global>{`
        :root{
          --bg:#f7f5f1; --panel:#ffffff; --panelAlt:#f2ede7; --ink:#2e2a24; --muted:#6f6257;
          --brand:#b5835a; --ok:#2fa36b; --warn:#d28512; --danger:#c63737; --ring:rgba(181,131,90,.25);
        }
        html,body{height:100%;margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
        .portal .wrap{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
        .sidebar{background:#fff;border-right:1px solid #e7e0d9;position:sticky;top:0;height:100vh;display:flex;flex-direction:column}
        .brand{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 12px;border-bottom:1px solid #eee}
        .crest{width:50px;height:50px;border-radius:12px;background:linear-gradient(145deg,#b5835a,#9a6c49);box-shadow:inset 0 0 0 4px #fff}
        .brandTitle{margin:4px 0 0 0;display:flex;flex-direction:column;align-items:center;gap:2px}
        .brandTitle span{display:block;line-height:1.05}
        .brandTitle span:first-child{font-size:1.15rem;font-weight:700}
        .brandTitle span:last-child{font-size:1.15rem;font-weight:700}

        .nav{padding:12px}
        .nav button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;margin:4px 0;border:0;background:transparent;border-radius:10px;color:var(--ink);cursor:pointer}
        .nav button:hover{background:var(--panelAlt)}
        .nav button.active{background:var(--brand);color:#fff}
        .nav .dot{width:8px;height:8px;border-radius:50%;background:var(--brand);opacity:.25}

        .spacer{flex:1}
        .authBox{padding:12px;border-top:1px solid #eee;display:grid;gap:8px}
        .authBox .email{font-weight:600}
        .miniForm{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
        .miniForm input, .miniForm select{flex:1;min-width:180px}
        .btn{appearance:none;border:1px solid #e0d8d0;background:#fff;color:var(--ink);padding:8px 10px;border-radius:10px;cursor:pointer}
        .btn.primary{background:var(--brand);border-color:var(--brand);color:#fff}

        .main{padding:22px;min-height:100vh}
        .header{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px}
        .header h2{margin:0;font-size:1.35rem}
        .crumbs{color:var(--muted);font-size:.9rem}

        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
        .card{grid-column:span 12;background:var(--panel);border:1px solid #e7e0d9;border-radius:14px;padding:16px}
        @media (min-width:900px){
          .span12{grid-column:span 12}.span8{grid-column:span 8}.span4{grid-column:span 4}
          .col4{grid-column:span 4}.col3{grid-column:span 3}.col6{grid-column:span 6}.col8{grid-column:span 8}
        }
        .row{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
        .row .col2,.row .col3,.row .col4,.row .col6,.row .col8{grid-column:span 12}
        @media (min-width:900px){
          .row .col2{grid-column:span 2}.row .col3{grid-column:span 3}.row .col4{grid-column:span 4}
          .row .col6{grid-column:span 6}.row .col8{grid-column:span 8}
        }
        label{display:block;font-size:.9rem;margin:10px 0 6px}
        input,select,textarea{width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;background:#fff;outline:0}
        input:focus,select:focus,textarea:focus{border-color:var(--brand);box-shadow:0 0 0 4px var(--ring)}
        .lead{color:var(--muted)}
        .notice{padding:10px 12px;border-left:4px solid var(--brand);background:#fff;border:1px solid #eee;border-radius:8px;margin:8px 0}

        .signup .row{align-items:center}
        .quickGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px}
        @media (max-width:900px){ .quickGrid{grid-template-columns:repeat(2,1fr);} }
        .qcard{display:block;border:1px solid #e7e0d9;background:#fff;border-radius:12px;padding:14px;text-decoration:none;color:inherit}
        .qcard:hover{background:var(--panelAlt)}
        .qtitle{font-weight:700}
        .qsub{color:var(--muted);font-size:.9rem}

        .cardList{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        @media (max-width:1100px){ .cardList{grid-template-columns:repeat(2,1fr);} }
        @media (max-width:700px){ .cardList{grid-template-columns:1fr;} }

        .litterCard{border:1px solid #e7e0d9;background:#fff;border-radius:12px;padding:12px}
        .lhd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .lcode{font-weight:700}
        .ldate{color:var(--muted);font-size:.9rem}
        .lrow{display:flex;gap:18px;flex-wrap:wrap;margin:6px 0}
        .chips{display:flex;gap:8px;flex-wrap:wrap}
        .chip{padding:4px 8px;border-radius:999px;font-size:.8rem;border:1px solid #eee}
        .chip.ok{background:rgba(47,163,107,.12);color:#1f6b47}
        .chip.warn{background:rgba(210,133,18,.12);color:#6f470e}
        .chip.danger{background:rgba(198,55,55,.12);color:#7a2222}
        .plist{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px}
        .pitem{display:flex;gap:10px;align-items:center;border:1px solid #eee;border-radius:10px;padding:8px}
        .pimg{width:64px;height:64px;border-radius:10px;background:#f2ede7;background-size:cover;background-position:center}

        .heroImg{width:100%;padding-top:66%;background:#f2ede7;border-radius:12px;background-size:cover;background-position:center}
        .kv{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 16px;margin-top:8px}
        .kv label{display:block;font-size:.8rem;color:var(--muted);margin:0}
        .kv span{display:block}
        .weightList{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .wrow{border:1px solid #eee;border-radius:8px;padding:8px;display:flex;align-items:center;justify-content:space-between}
        .subsection{margin-top:14px}
        h4{margin:8px 0}

        .table{width:100%;border-collapse:separate;border-spacing:0 8px}
        .table thead th{font-size:.85rem;color:var(--muted);text-align:left;padding:8px 10px}
        .table tbody td{background:#fff;padding:10px;border-top:1px solid #eee;border-bottom:1px solid #eee}
        .table tbody tr td:first-child{border-left:1px solid #eee;border-top-left-radius:8px;border-bottom-left-radius:8px}
        .table tbody tr td:last-child{border-right:1px solid #eee;border-top-right-radius:8px;border-bottom-right-radius:8px}

        .chatBox{display:grid;gap:8px;max-height:50vh;overflow:auto;border:1px solid #eee;border-radius:12px;padding:10px;background:#fff}
        .bubble{max-width:720px;border-radius:12px;padding:10px;border:1px solid #eee}
        .bubble.me{margin-left:auto;background:#fff9f2;border-color:#eadfd3}
        .bubble.them{margin-right:auto;background:#f6f6f6;border-color:#e5e5e5}
        .bubble .meta{font-size:.8rem;color:var(--muted);margin-bottom:4px}
        .bubble .text{white-space:pre-wrap}
        .chatForm{display:flex;gap:8px;margin-top:8px}
        .chatForm input{flex:1}
      `}</style>
    </main>
  );
}
