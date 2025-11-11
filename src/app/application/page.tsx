'use client';

/* ============================================
   CHANGELOG
   - 2025-11-11: Initial application page
   - 2025-11-11: Type fix for PDF declarations array
                 (decos typed as [string, boolean][])
   ============================================
   ANCHOR: PUPPY_APPLICATION_PAGE
*/

import React, { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

type AppState = {
  // Section 1: Applicant
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact_method: string;

  // Preferences
  preferred_coat: string;
  preferred_gender: string;
  color_preference: string;
  desired_date: string;     // yyyy-mm-dd
  interest_type: string;    // Current Puppy / Future Puppy / Either
  current_puppy: string;

  // Lifestyle & Home
  other_pets: string;       // Yes/No
  pet_details: string;
  owned_chi: string;        // Yes/No
  home_type: string;
  fenced_yard: string;      // Yes/No
  work_status: string;
  caregiver: string;
  children_at_home: string;

  // Payment & Agreement
  payment_preference: string;
  heard_about: string;
  ready_to_deposit: string; // Yes/No
  questions: string;

  // Terms + Declarations
  terms_agreed: boolean;
  decl_age: boolean;
  decl_accuracy: boolean;
  decl_home: boolean;
  decl_care: boolean;
  decl_health: boolean;
  decl_deposit: boolean;
  decl_price_tax: boolean;
  decl_contract: boolean;
  decl_return: boolean;
  decl_release: boolean;
  decl_terms: boolean;
  decl_comms: boolean;

  signature: string;
  signature_datetime: string; // yyyy-mm-ddThh:mm
};

export default function PuppyApplicationPage() {
  const supabase = getBrowserClient();
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string>('');
  const [pdfUrl, setPdfUrl]   = useState<string>('');
  const formRef               = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // noop: we used to read meEmail; keeping hook in case you want to gate later
    (async () => { await supabase.auth.getUser(); })();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(''); setSaving(true);

    const fd = new FormData(e.currentTarget);
    const v  = (name: string) => String(fd.get(name) ?? '').trim();

    const state: AppState = {
      full_name: v('full_name'),
      email: v('email'),
      phone: v('phone'),
      address: v('address'),
      city: v('city'),
      state: v('state'),
      zip: v('zip'),
      contact_method: v('contact_method'),

      preferred_coat: v('preferred_coat'),
      preferred_gender: v('preferred_gender'),
      color_preference: v('color_preference'),
      desired_date: v('desired_date'),
      interest_type: v('interest_type'),
      current_puppy: v('current_puppy'),

      other_pets: v('other_pets'),
      pet_details: v('pet_details'),
      owned_chi: v('owned_chi'),
      home_type: v('home_type'),
      fenced_yard: v('fenced_yard'),
      work_status: v('work_status'),
      caregiver: v('caregiver'),
      children_at_home: v('children_at_home'),

      payment_preference: v('payment_preference'),
      heard_about: v('heard_about'),
      ready_to_deposit: v('ready_to_deposit'),
      questions: v('questions'),

      terms_agreed: fd.get('terms_agreed') === 'on',
      decl_age: fd.get('decl_age') === 'on',
      decl_accuracy: fd.get('decl_accuracy') === 'on',
      decl_home: fd.get('decl_home') === 'on',
      decl_care: fd.get('decl_care') === 'on',
      decl_health: fd.get('decl_health') === 'on',
      decl_deposit: fd.get('decl_deposit') === 'on',
      decl_price_tax: fd.get('decl_price_tax') === 'on',
      decl_contract: fd.get('decl_contract') === 'on',
      decl_return: fd.get('decl_return') === 'on',
      decl_release: fd.get('decl_release') === 'on',
      decl_terms: fd.get('decl_terms') === 'on',
      decl_comms: fd.get('decl_comms') === 'on',

      signature: v('signature'),
      signature_datetime: v('signature_datetime')
    };

    if (!state.full_name || !state.state || !state.terms_agreed) {
      setSaving(false);
      setMsg('Please complete required fields (Full Name, State, and Terms).');
      return;
    }

    try {
      // attach user_id if logged in
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth.user?.id ?? null;

      const insertRow = {
        user_id,
        full_name: state.full_name,
        buyer_name: state.full_name,   // keeps admin view compatibility
        email: state.email,
        phone: state.phone,
        address: state.address,
        city: state.city,
        state: state.state,
        zip: state.zip,
        contact_method: state.contact_method,
        preferred_coat: state.preferred_coat,
        preferred_gender: state.preferred_gender,
        color_preference: state.color_preference,
        desired_date: state.desired_date || null,
        interest_type: state.interest_type,
        current_puppy: state.current_puppy,
        other_pets: state.other_pets.toLowerCase() === 'yes',
        pet_details: state.pet_details,
        owned_chi: state.owned_chi.toLowerCase() === 'yes',
        home_type: state.home_type,
        fenced_yard: state.fenced_yard.toLowerCase() === 'yes',
        work_status: state.work_status,
        caregiver: state.caregiver,
        children_at_home: state.children_at_home,
        payment_preference: state.payment_preference,
        heard_about: state.heard_about,
        ready_to_deposit: state.ready_to_deposit.toLowerCase() === 'yes',
        questions: state.questions,
        terms_agreed: state.terms_agreed,
        declarations: {
          age: state.decl_age,
          accuracy: state.decl_accuracy,
          home: state.decl_home,
          care: state.decl_care,
          health: state.decl_health,
          deposit: state.decl_deposit,
          price_tax: state.decl_price_tax,
          contract: state.decl_contract,
          return: state.decl_return,
          release: state.decl_release,
          terms: state.decl_terms,
          comms: state.decl_comms
        },
        signature: state.signature,
        signature_datetime: state.signature_datetime ? new Date(state.signature_datetime).toISOString() : null,
        status: 'submitted'
      };

      const { data: appIns, error: appErr } =
        await supabase.from('applications').insert(insertRow).select('id,user_id').single();
      if (appErr) throw appErr;
      const appId = appIns!.id as string;

      // Generate PDF in-browser
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', compress: true });

      const NL = '\n';
      const title = 'Southwest Virginia Chihuahua — Puppy Application';
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(14);
      doc.text(title, 40, 50);
      doc.setFont('Helvetica', 'normal'); doc.setFontSize(10);

      function block(label: string, value: string) {
        const lines = doc.splitTextToSize(`${label}: ${value || '-'}`, 535);
        const h = lines.length * 14;
        doc.text(lines, 40, y);
        y += h + 6;
      }
      let y = 80;

      // Applicant
      doc.setFont('Helvetica','bold'); doc.text('Applicant Info', 40, y); y+=16; doc.setFont('Helvetica','normal');
      block('Full Name', state.full_name);
      block('Email', state.email);
      block('Phone', state.phone);
      block('Address', `${state.address}, ${state.city}, ${state.state} ${state.zip}`);
      block('Preferred Contact', state.contact_method);

      // Preferences
      doc.setFont('Helvetica','bold'); doc.text('Puppy Preferences', 40, y); y+=16; doc.setFont('Helvetica','normal');
      block('Coat', state.preferred_coat);
      block('Gender', state.preferred_gender);
      block('Color', state.color_preference);
      block('Desired Date', state.desired_date);
      block('Interest Type', state.interest_type);
      block('Current Puppy', state.current_puppy);

      // Lifestyle
      doc.setFont('Helvetica','bold'); doc.text('Lifestyle & Home', 40, y); y+=16; doc.setFont('Helvetica','normal');
      block('Other Pets', state.other_pets);
      block('Pet Details', state.pet_details);
      block('Owned a Chihuahua Before', state.owned_chi);
      block('Home Type', state.home_type);
      block('Fenced Yard', state.fenced_yard);
      block('Work Status', state.work_status);
      block('Who Cares for Puppy', state.caregiver);
      block('Children at Home', state.children_at_home);

      // Payment
      doc.setFont('Helvetica','bold'); doc.text('Payment & Agreement', 40, y); y+=16; doc.setFont('Helvetica','normal');
      block('Payment Preference', state.payment_preference);
      block('Heard About Us', state.heard_about);
      block('Ready to Place Deposit', state.ready_to_deposit);
      block('Questions', state.questions);

      // Declarations (typed correctly)
      doc.setFont('Helvetica','bold'); doc.text('Applicant Declarations', 40, y); y+=16; doc.setFont('Helvetica','normal');
      const decos: [string, boolean][] = [
        ['Age and Capacity', state.decl_age],
        ['Accuracy of Information', state.decl_accuracy],
        ['Home Environment & Pet Ownership', state.decl_home],
        ['Puppy Care Commitment', state.decl_care],
        ['Health Guarantee Understanding', state.decl_health],
        ['Nonrefundable Deposit', state.decl_deposit],
        ['Purchase Price & Tax Acknowledgment', state.decl_price_tax],
        ['Contractual Obligation', state.decl_contract],
        ['Return & Rehoming Policy', state.decl_return],
        ['Release of Liability', state.decl_release],
        ['Agreement to Terms & Conditions', state.decl_terms],
        ['Consent to Communications', state.decl_comms],
      ];
      for (const [label, ok] of decos) block(label, ok ? 'Yes' : 'No');

      // Signature
      doc.setFont('Helvetica','bold'); doc.text('Signature', 40, y); y+=16; doc.setFont('Helvetica','normal');
      block('Name / Typed Signature', state.signature);
      block('Date-Time', state.signature_datetime);

      // Footer
      if (y > 760) { doc.addPage(); y = 60; }
      doc.setFontSize(9);
      doc.text(`Application ID: ${appId}${NL}Saved for your records.`, 40, 780);

      const pdfBlob = doc.output('blob');
      const key = `applications/${appId}.pdf`;
      const up = await supabase.storage.from('docs').upload(key, pdfBlob, { contentType: 'application/pdf', upsert: true });
      if (up.error) throw up.error;

      // Create a document row (attach to user if known)
      const { error: dErr } = await supabase.from('documents').insert({
        user_id: appIns!.user_id ?? null,
        application_id: appId,
        label: 'Puppy Application',
        file_key: key
      });
      if (dErr) throw dErr;

      // Public URL to hand back immediately
      const pub = await supabase.storage.from('docs').getPublicUrl(key);
      setPdfUrl(pub.data.publicUrl || '');
      setMsg('Thank you! Your application was submitted and a PDF copy has been saved.');
      (formRef.current as HTMLFormElement)?.reset();
    } catch (err: any) {
      setMsg(err.message || 'Sorry, something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="apply">
      <header className="hero">
        <div className="wrap">
          <h1>Puppy Application</h1>
          <p className="lead">Apply to adopt a Chihuahua from Southwest Virginia Chihuahua.</p>
        </div>
      </header>

      <section className="wrap">
        <form ref={formRef} onSubmit={onSubmit} className="card">
          <h2>Section 1: Applicant Info</h2>
          <div className="grid">
            <div className="col6"><label>First and Last Name *</label><input name="full_name" required /></div>
            <div className="col6"><label>Email Address</label><input type="email" name="email" /></div>
            <div className="col6"><label>Phone Number</label><input name="phone" /></div>
            <div className="col12"><label>Street Address</label><input name="address" /></div>
            <div className="col4"><label>City</label><input name="city" /></div>
            <div className="col4"><label>State *</label><input name="state" required /></div>
            <div className="col4"><label>Zip Code</label><input name="zip" /></div>
            <div className="col6"><label>Preferred Contact Method</label><input name="contact_method" placeholder="Email / Phone / Text" /></div>
          </div>

          <h2>Puppy Preferences</h2>
          <div className="grid">
            <div className="col4"><label>Preferred Coat Type</label><input name="preferred_coat" /></div>
            <div className="col4"><label>Preferred Gender</label><input name="preferred_gender" /></div>
            <div className="col4"><label>Color Preference</label><input name="color_preference" /></div>
            <div className="col4"><label>Desired Adoption Date</label><input type="date" name="desired_date" /></div>
            <div className="col4"><label>Interest Type</label>
              <select name="interest_type">
                <option value="">—</option>
                <option>Current Puppy</option>
                <option>Future Puppy</option>
                <option>Either</option>
              </select>
            </div>
            <div className="col4"><label>Current Puppy</label><input name="current_puppy" placeholder="(If applicable)" /></div>
          </div>

          <h2>Lifestyle & Home</h2>
          <div className="grid">
            <div className="col4"><label>Do You Have Other Pets?</label><select name="other_pets"><option>—</option><option>Yes</option><option>No</option></select></div>
            <div className="col8"><label>Pet Details</label><input name="pet_details" /></div>
            <div className="col4"><label>Owned A Chihuahua Before?</label><select name="owned_chi"><option>—</option><option>Yes</option><option>No</option></select></div>
            <div className="col4"><label>Home Type</label><input name="home_type" /></div>
            <div className="col4"><label>Fenced Yard?</label><select name="fenced_yard"><option>—</option><option>Yes</option><option>No</option></select></div>
            <div className="col4"><label>Work Status</label><input name="work_status" /></div>
            <div className="col4"><label>Who Cares for Puppy?</label><input name="caregiver" /></div>
            <div className="col4"><label>Children at Home</label><input name="children_at_home" /></div>
          </div>

          <h2>Payment & Agreement</h2>
          <div className="grid">
            <div className="col4"><label>Payment Preference</label><input name="payment_preference" /></div>
            <div className="col4"><label>How Did you Hear about us?</label><input name="heard_about" /></div>
            <div className="col4"><label>Ready to Place Deposit?</label><select name="ready_to_deposit"><option>—</option><option>Yes</option><option>No</option></select></div>
            <div className="col12"><label>Please input any questions that you may have here.</label><textarea name="questions" rows={3} /></div>
          </div>

          <h2>Terms and Conditions *</h2>
          <div className="terms">
            <p><b>Read carefully:</b> By submitting, you agree to the Terms and Conditions and all declarations you check below. (Full text is referenced; this form stores your acceptance and a PDF copy.)</p>
          </div>
          <label className="chk"><input type="checkbox" name="terms_agreed" /> <span>I have read and agree to the Terms and Conditions.</span></label>

          <h2>Applicant Declarations</h2>
          <div className="grid">
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_age" /> <span>Age and Capacity</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_accuracy" /> <span>Accuracy of Information</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_home" /> <span>Home Environment & Pet Ownership</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_care" /> <span>Puppy Care Commitment</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_health" /> <span>Health Guarantee Understanding</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_deposit" /> <span>Nonrefundable Deposit</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_price_tax" /> <span>Purchase Price & Tax</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_contract" /> <span>Contractual Obligation</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_return" /> <span>Return & Rehoming Policy</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_release" /> <span>Release of Liability</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_terms" /> <span>Agreement to Terms & Conditions</span></label></div>
            <div className="col6"><label className="chk"><input type="checkbox" name="decl_comms" /> <span>Consent to Communications</span></label></div>
          </div>

          <h2>Signature</h2>
          <div className="grid">
            <div className="col6"><label>E-Signature (type your full name)</label><input name="signature" placeholder="Full Name" /></div>
            <div className="col6"><label>Date-Time</label><input type="datetime-local" name="signature_datetime" /></div>
          </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit Application'}</button>
            {msg && <span className="note">{msg}</span>}
          </div>

          {pdfUrl && (
            <div className="notice">
              <a href={pdfUrl} target="_blank" rel="noreferrer">Open your saved PDF application</a>
            </div>
          )}
        </form>
      </section>

      <style jsx global>{`
        :root{
          --bg:#f7e8d7; --panel:#fff9f2; --ink:#2e2a24; --muted:#6f6257;
          --accent:#b5835a; --accentHover:#9a6c49; --ring:rgba(181,131,90,.25);
        }
        html,body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
        .wrap{max-width:1000px;margin:0 auto;padding:24px 16px}
        .hero{background:linear-gradient(180deg,var(--panel),transparent);border-bottom:1px solid #ecdccc}
        .hero h1{margin:0 0 6px}
        .lead{margin:0;color:var(--muted)}
        .card{background:#fff;border:1px solid #ecdccc;border-radius:14px;padding:16px}
        h2{margin:18px 0 8px;font-size:1.1rem}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
        .col12{grid-column:span 12}.col8{grid-column:span 12}.col6{grid-column:span 12}.col4{grid-column:span 12}
        @media (min-width:900px){ .col8{grid-column:span 8}.col6{grid-column:span 6}.col4{grid-column:span 4} }
        label{display:block;font-size:.9rem;margin:6px 0}
        input,select,textarea{width:100%;padding:10px;border:1px solid #e3d6c9;border-radius:10px;background:#fff;outline:0}
        input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--ring)}
        .chk{display:flex;align-items:center;gap:8px}
        .terms{max-height:180px;overflow:auto;border:1px solid #ecdccc;border-radius:10px;padding:10px;background:var(--panel)}
        .actions{display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap}
        .btn{appearance:none;border:1px solid #e3d6c9;background:#fff;color:var(--ink);padding:10px 14px;border-radius:12px;cursor:pointer}
        .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
        .btn.primary:hover{background:var(--accentHover);border-color:var(--accentHover)}
        .note{color:var(--muted)}
        .notice{margin-top:12px;padding:10px;border-left:4px solid var(--accent);background:#fff;border:1px solid #ecdccc;border-radius:10px}
      `}</style>
    </main>
  );
}
