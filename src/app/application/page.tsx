"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";

type DeclarationKey =
  | "ageCapacity"
  | "accuracy"
  | "homeEnvironment"
  | "puppyCare"
  | "healthGuarantee"
  | "nonrefundableDeposit"
  | "purchasePriceTax"
  | "contractualObligation"
  | "returnRehoming"
  | "releaseLiability"
  | "agreeTerms"
  | "consentCommunications";

type FormState = {
  // Section 1: Applicant Info
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  preferredContact: string;

  // Puppy Preferences
  preferredCoatType: string;
  preferredGender: string;
  colorPreference: string;
  desiredAdoptionDate: string;
  interestType: "current" | "future" | "";

  // Lifestyle & Home
  haveOtherPets: "yes" | "no" | "";
  petDetails: string;
  ownedChihuahuaBefore: "yes" | "no" | "";
  homeType: string;
  fencedYard: "yes" | "no" | "";
  workStatus: string;
  whoCaresForPuppy: string;
  childrenAtHome: string;

  // Payment & Agreement
  paymentPreference: string;
  hearAboutUs: string;
  readyToPlaceDeposit: "yes" | "no" | "";
  questions: string;

  // Terms & Declarations
  termsAccepted: boolean;
  declarations: Record<DeclarationKey, boolean>;

  // Signature
  signedAt: string;
  signature: string;
};

const initialDeclarations: Record<DeclarationKey, boolean> = {
  ageCapacity: false,
  accuracy: false,
  homeEnvironment: false,
  puppyCare: false,
  healthGuarantee: false,
  nonrefundableDeposit: false,
  purchasePriceTax: false,
  contractualObligation: false,
  returnRehoming: false,
  releaseLiability: false,
  agreeTerms: false,
  consentCommunications: false,
};

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  preferredContact: "",

  preferredCoatType: "",
  preferredGender: "",
  colorPreference: "",
  desiredAdoptionDate: "",
  interestType: "",

  haveOtherPets: "",
  petDetails: "",
  ownedChihuahuaBefore: "",
  homeType: "",
  fencedYard: "",
  workStatus: "",
  whoCaresForPuppy: "",
  childrenAtHome: "",

  paymentPreference: "",
  hearAboutUs: "",
  readyToPlaceDeposit: "",
  questions: "",

  termsAccepted: false,
  declarations: initialDeclarations,

  signedAt: "",
  signature: "",
};

const DECLARATIONS: {
  key: DeclarationKey;
  title: string;
  text: string;
}[] = [
  {
    key: "ageCapacity",
    title: "Age and Capacity",
    text:
      "I declare that I am at least 18 years of age and legally competent to enter into contracts.",
  },
  {
    key: "accuracy",
    title: "Accuracy of Information",
    text:
      "I declare that all information provided in this application is complete, accurate, and truthful to the best of my knowledge. I understand that providing any false or misleading information may result in immediate rejection of my application or forfeiture of any deposit paid.",
  },
  {
    key: "homeEnvironment",
    title: "Home Environment & Pet Ownership",
    text:
      "I declare that I have permission from my landlord (if renting) to keep a dog at my residence, and that my home environment is suitable for a Chihuahua puppy (e.g., safe, secure, and free of hazards). I further declare that no one in my household is allergic to dogs.",
  },
  {
    key: "puppyCare",
    title: "Puppy Care Commitment",
    text:
      "I declare that I am committed to providing my puppy with proper nutrition, veterinary care (including vaccinations, deworming, and parasite prevention), grooming, exercise, and socialization throughout its life. I understand the financial responsibilities of dog ownership.",
  },
  {
    key: "healthGuarantee",
    title: "Health Guarantee Understanding",
    text:
      "I declare that I have read and understand the Puppy Sales Agreement and Health Guarantee. I agree to take my puppy to a licensed veterinarian within 10 days of coming home. If a covered congenital or genetic condition is diagnosed, I will provide written documentation from the veterinarian to Southwest Virginia Chihuahua within the required timeframe. Failure to comply with these requirements may void the health guarantee.",
  },
  {
    key: "nonrefundableDeposit",
    title: "Nonrefundable Deposit",
    text:
      "I declare that, if my application is approved, I will pay a nonrefundable $250 deposit to reserve my puppy. I understand this deposit is nonrefundable under all circumstances and is applied toward my total purchase price.",
  },
  {
    key: "purchasePriceTax",
    title: "Purchase Price & Tax Acknowledgment",
    text:
      "I declare that I understand the total purchase price is $1,800 for a male puppy or $2,200 for a female puppy. I acknowledge that Virginia sales tax (5.3%) will be calculated and shown separately, and that the remaining balance (minus deposit, plus tax) must be paid in full before I take possession of the puppy.",
  },
  {
    key: "contractualObligation",
    title: "Contractual Obligation",
    text:
      "I declare that, upon paying my deposit, I will sign the Puppy Sales Agreement and Health Guarantee via Zoho Sign. I understand that no puppy will be released to me until the signed contract and all payments are complete.",
  },
  {
    key: "returnRehoming",
    title: "Return & Rehoming Policy",
    text:
      "I declare that, if at any time I am unable to care for this puppy, I will first offer to return it to Southwest Virginia Chihuahua. I will not sell, transfer, or surrender the puppy to any third party, shelter, or pet store without first contacting the breeder.",
  },
  {
    key: "releaseLiability",
    title: "Release of Liability",
    text:
      "I declare that Southwest Virginia Chihuahua, its owners, employees, and agents shall not be held liable for any illness, injury, or damages (including veterinary costs, property damage, or personal injury) that may occur after the date of transfer of ownership.",
  },
  {
    key: "agreeTerms",
    title: "Agreement to Terms & Conditions",
    text:
      "I declare that I have read, understand, and agree to be bound by the Terms and Conditions, Privacy Policy, and any other puppy adoption policies posted on the Southwest Virginia Chihuahua website and provided in the Puppy Packet.",
  },
  {
    key: "consentCommunications",
    title: "Consent to Communications",
    text:
      "I consent to receive emails, text messages, and phone calls from Southwest Virginia Chihuahua regarding my application status, payment reminders, puppy updates, and any other adoption-related communications.",
  },
];

export default function PuppyApplicationPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null); // documents.id for this application

  const totalDeclarations = DECLARATIONS.length;
  const completedDeclarations = useMemo(
    () => Object.values(form.declarations).filter((v) => v === true).length,
    [form.declarations]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDeclaration(key: DeclarationKey, value: boolean) {
    setForm((prev) => ({
      ...prev,
      declarations: { ...prev.declarations, [key]: value },
    }));
  }

  // On load: get logged-in user, and create/find a "To Complete" documents row
  useEffect(() => {
    const supabase = getBrowserClient();

    async function initDoc() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Failed to get user:", error.message);
        return;
      }
      const user = data?.user;
      if (!user) return;

      setUserId(user.id);

      // Look for an existing application document for this user
      const { data: existing, error: docErr } = await supabase
        .from("documents")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("doc_type", "application")
        .order("created_at", { ascending: false })
        .limit(1);

      if (docErr) {
        console.error("Failed to load documents:", docErr.message);
        return;
      }

      if (existing && existing.length > 0) {
        setDocId(String(existing[0].id));
        return;
      }

      // Create a "To Complete" document row the first time
      const { data: inserted, error: insertErr } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: "Puppy Application",
          doc_type: "application",
          status: "to_complete",
          route: "/application",
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Failed to create application document:", insertErr.message);
        return;
      }

      setDocId(String(inserted.id));
    }

    initDoc();
  }, []);

  function buildApplicationPdf(f: FormState) {
    const doc = new jsPDF();
    let y = 12;

    doc.setFontSize(16);
    doc.text("Southwest Virginia Chihuahua", 10, y);
    y += 7;
    doc.setFontSize(14);
    doc.text("Puppy Application", 10, y);
    y += 8;
    doc.setFontSize(10);

    function addSectionTitle(title: string) {
      if (y > 270) {
        doc.addPage();
        y = 12;
      }
      doc.setFont(undefined, "bold");
      doc.text(title, 10, y);
      y += 5;
      doc.setFont(undefined, "normal");
    }

    function addLine(line: string) {
      const maxWidth = 180;
      const lines = doc.splitTextToSize(line, maxWidth);
      lines.forEach((ln: string) => {
        if (y > 270) {
          doc.addPage();
          y = 12;
        }
        doc.text(ln, 10, y);
        y += 4;
      });
    }

    // Applicant Info
    addSectionTitle("Section 1: Applicant Information");
    addLine(`Name: ${f.fullName || "-"}`);
    addLine(`Email: ${f.email || "-"}`);
    addLine(`Phone: ${f.phone || "-"}`);
    addLine(
      `Address: ${f.streetAddress || ""} ${f.city || ""} ${f.state || ""} ${
        f.zip || ""
      }`.trim() || "-"
    );
    addLine(`Preferred Contact: ${f.preferredContact || "-"}`);

    // Puppy Preferences
    addSectionTitle("Puppy Preferences");
    addLine(
      `Coat Type: ${
        f.preferredCoatType ? f.preferredCoatType : "No specific preference"
      }`
    );
    addLine(
      `Gender: ${f.preferredGender ? f.preferredGender : "No specific preference"}`
    );
    addLine(
      `Color Preference: ${
        f.colorPreference ? f.colorPreference : "No specific preference"
      }`
    );
    addLine(
      `Desired Adoption Date: ${f.desiredAdoptionDate || "Not specified"}`
    );
    addLine(
      `Interest Type: ${
        f.interestType === "current"
          ? "Current puppy"
          : f.interestType === "future"
          ? "Future puppy"
          : "Not specified"
      }`
    );

    // Lifestyle & Home
    addSectionTitle("Lifestyle & Home");
    addLine(
      `Other Pets: ${
        f.haveOtherPets === "yes"
          ? "Yes"
          : f.haveOtherPets === "no"
          ? "No"
          : "Not specified"
      }`
    );
    if (f.petDetails) addLine(`Pet Details: ${f.petDetails}`);
    addLine(
      `Owned Chihuahua Before: ${
        f.ownedChihuahuaBefore === "yes"
          ? "Yes"
          : f.ownedChihuahuaBefore === "no"
          ? "No"
          : "Not specified"
      }`
    );
    addLine(`Home Type: ${f.homeType || "Not specified"}`);
    addLine(
      `Fenced Yard: ${
        f.fencedYard === "yes"
          ? "Yes"
          : f.fencedYard === "no"
          ? "No"
          : "Not specified"
      }`
    );
    addLine(`Work Status: ${f.workStatus || "Not specified"}`);
    addLine(
      `Primary Caregiver: ${f.whoCaresForPuppy || "Not specified"}`
    );
    if (f.childrenAtHome) addLine(`Children at Home: ${f.childrenAtHome}`);

    // Payment & Agreement
    addSectionTitle("Payment & Agreement");
    addLine(
      `Payment Preference: ${f.paymentPreference || "Not specified"}`
    );
    if (f.hearAboutUs)
      addLine(`Heard About Us: ${f.hearAboutUs}`);
    addLine(
      `Ready to Place Deposit: ${
        f.readyToPlaceDeposit === "yes"
          ? "Yes"
          : f.readyToPlaceDeposit === "no"
          ? "No"
          : "Not specified"
      }`
    );
    if (f.questions) addLine(`Applicant Questions: ${f.questions}`);

    // Declarations
    addSectionTitle("Applicant Declarations Summary");
    addLine(
      `Declarations accepted: ${
        Object.values(f.declarations).filter(Boolean).length
      } of ${DECLARATIONS.length}`
    );
    DECLARATIONS.forEach((d) => {
      const checked = f.declarations[d.key] ? "[X]" : "[ ]";
      addLine(`${checked} ${d.title}`);
    });

    // Signature
    addSectionTitle("Signature");
    addLine(`Signed At: ${f.signedAt || "-"}`);
    addLine(`Signature: ${f.signature || "-"}`);

    return doc;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // Basic validation
    if (!form.fullName || !form.email || !form.phone || !form.state) {
      setErrorMsg(
        "Please complete your name, email, phone, and state before submitting."
      );
      return;
    }

    if (!form.termsAccepted) {
      setErrorMsg("You must read and accept the Terms and Conditions.");
      return;
    }

    if (completedDeclarations !== totalDeclarations) {
      setErrorMsg(
        "Please review and check each Applicant Declaration before submitting."
      );
      return;
    }

    if (!form.signature || !form.signedAt) {
      setErrorMsg("Please provide the date/time and your typed signature.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getBrowserClient();

      // Ensure we have a logged-in user
      let currentUserId = userId;
      if (!currentUserId) {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("auth.getUser error:", error.message);
          setErrorMsg("Could not confirm your login. Please sign in again.");
          return;
        }
        const user = data?.user;
        if (!user) {
          setErrorMsg("Please sign in before submitting your application.");
          return;
        }
        currentUserId = user.id;
        setUserId(user.id);
      }

      // 1) Save to applications table
      const { data: appInsert, error: appErr } = await supabase
        .from("applications")
        .insert({
          user_id: currentUserId,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          application_json: form,
          status: "submitted",
          source: "portal",
        })
        .select("id")
        .single();

      if (appErr) {
        console.error("applications insert error:", appErr.message);
        setErrorMsg(
          "Could not save your application. Please try again or contact us."
        );
        return;
      }

      const applicationId = appInsert?.id ?? null;

      // 2) Build PDF
      const pdf = buildApplicationPdf(form);
      const pdfBlob = pdf.output("blob");

      // 3) Upload PDF to Supabase Storage (bucket: documents)
      const fileName = `applications/${currentUserId}/${Date.now()}-application.pdf`;
      const { error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        console.error("storage upload error:", uploadErr.message);
        setErrorMsg(
          "Your application was saved, but we could not store the PDF document. Please let us know."
        );
        return;
      }

      const filePath = fileName;

      // 4) Update or insert into documents table
      if (docId) {
        const { error: docUpdateErr } = await supabase
          .from("documents")
          .update({
            status: "completed",
            file_path: filePath,
            completed_at: new Date().toISOString(),
            source_table: "applications",
            source_id: applicationId,
          })
          .eq("id", docId)
          .eq("user_id", currentUserId);

        if (docUpdateErr) {
          console.error("documents update error:", docUpdateErr.message);
          // We don't block the submission; just log
        }
      } else {
        const { error: docInsertErr } = await supabase.from("documents").insert({
          user_id: currentUserId,
          title: "Puppy Application",
          doc_type: "application",
          status: "completed",
          file_path: filePath,
          route: "/application",
          source_table: "applications",
          source_id: applicationId,
        });
        if (docInsertErr) {
          console.error("documents insert error:", docInsertErr.message);
        }
      }

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <h1>Puppy Application</h1>
          <p>
            Please complete this application as accurately as possible. It helps
            us match you with the best Chihuahua for your home and lifestyle.
          </p>
        </header>

        {errorMsg && <div className="banner banner-error">{errorMsg}</div>}

        {submitted && (
          <div className="banner banner-success">
            Thank you! Your application has been submitted. A copy of this
            application is now stored in your Documents tab under Completed.
          </div>
        )}

        <form className="app-grid" onSubmit={handleSubmit}>
          {/* SECTION 1: APPLICANT INFO */}
          <section className="card">
            <h2>Section 1: Applicant Information</h2>
            <div className="grid-2">
              <div className="field">
                <label>
                  First and Last Name <span className="req">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="First and Last Name"
                  required
                />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 555-5555"
                  required
                />
              </div>
              <div className="field">
                <label>Preferred Contact Method</label>
                <select
                  value={form.preferredContact}
                  onChange={(e) =>
                    updateField("preferredContact", e.target.value)
                  }
                >
                  <option value="">Select one</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="text">Text Message</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Street Address</label>
              <input
                value={form.streetAddress}
                onChange={(e) =>
                  updateField("streetAddress", e.target.value)
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid-3">
              <div className="field">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="field">
                <label>
                  State <span className="req">*</span>
                </label>
                <input
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="VA"
                  required
                />
              </div>
              <div className="field">
                <label>Zip Code</label>
                <input
                  value={form.zip}
                  onChange={(e) => updateField("zip", e.target.value)}
                  placeholder="Zip"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: PUPPY PREFERENCES */}
          <section className="card">
            <h2>Puppy Preferences</h2>
            <div className="grid-2">
              <div className="field">
                <label>Preferred Coat Type</label>
                <select
                  value={form.preferredCoatType}
                  onChange={(e) =>
                    updateField("preferredCoatType", e.target.value)
                  }
                >
                  <option value="">No preference</option>
                  <option value="short">Short Coat</option>
                  <option value="long">Long Coat</option>
                </select>
              </div>
              <div className="field">
                <label>Preferred Gender</label>
                <select
                  value={form.preferredGender}
                  onChange={(e) =>
                    updateField("preferredGender", e.target.value)
                  }
                >
                  <option value="">No preference</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Color Preference</label>
              <input
                value={form.colorPreference}
                onChange={(e) =>
                  updateField("colorPreference", e.target.value)
                }
                placeholder="Example: blue fawn, chocolate, no preference"
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Desired Adoption Date</label>
                <input
                  type="date"
                  value={form.desiredAdoptionDate}
                  onChange={(e) =>
                    updateField("desiredAdoptionDate", e.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>Interest Type</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="interestType"
                      value="current"
                      checked={form.interestType === "current"}
                      onChange={() =>
                        updateField("interestType", "current")
                      }
                    />
                    Current Puppy
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="interestType"
                      value="future"
                      checked={form.interestType === "future"}
                      onChange={() =>
                        updateField("interestType", "future")
                      }
                    />
                    Future Puppy
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: LIFESTYLE & HOME */}
          <section className="card">
            <h2>Lifestyle &amp; Home</h2>

            <div className="grid-2">
              <div className="field">
                <label>Do you have other pets?</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="haveOtherPets"
                      value="yes"
                      checked={form.haveOtherPets === "yes"}
                      onChange={() =>
                        updateField("haveOtherPets", "yes")
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="haveOtherPets"
                      value="no"
                      checked={form.haveOtherPets === "no"}
                      onChange={() =>
                        updateField("haveOtherPets", "no")
                      }
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="field">
                <label>Owned a Chihuahua before?</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="ownedChi"
                      value="yes"
                      checked={form.ownedChihuahuaBefore === "yes"}
                      onChange={() =>
                        updateField("ownedChihuahuaBefore", "yes")
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="ownedChi"
                      value="no"
                      checked={form.ownedChihuahuaBefore === "no"}
                      onChange={() =>
                        updateField("ownedChihuahuaBefore", "no")
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Pet Details (type, age, temperament, etc.)</label>
              <textarea
                rows={3}
                value={form.petDetails}
                onChange={(e) =>
                  updateField("petDetails", e.target.value)
                }
                placeholder="Tell us about your other pets, if any."
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Home Type</label>
                <select
                  value={form.homeType}
                  onChange={(e) =>
                    updateField("homeType", e.target.value)
                  }
                >
                  <option value="">Select one</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhome">Townhome</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Fenced Yard?</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="fencedYard"
                      value="yes"
                      checked={form.fencedYard === "yes"}
                      onChange={() =>
                        updateField("fencedYard", "yes")
                      }
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fencedYard"
                      value="no"
                      checked={form.fencedYard === "no"}
                      onChange={() =>
                        updateField("fencedYard", "no")
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Work Status</label>
                <input
                  value={form.workStatus}
                  onChange={(e) =>
                    updateField("workStatus", e.target.value)
                  }
                  placeholder="Example: full-time, part-time, retired"
                />
              </div>
              <div className="field">
                <label>Who will primarily care for the puppy?</label>
                <input
                  value={form.whoCaresForPuppy}
                  onChange={(e) =>
                    updateField("whoCaresForPuppy", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Children at Home (ages, part-time / full-time)</label>
              <textarea
                rows={2}
                value={form.childrenAtHome}
                onChange={(e) =>
                  updateField("childrenAtHome", e.target.value)
                }
              />
            </div>
          </section>

          {/* SECTION 4: PAYMENT & AGREEMENT */}
          <section className="card">
            <h2>Payment &amp; Agreement</h2>

            <div className="grid-2">
              <div className="field">
                <label>Payment Preference</label>
                <select
                  value={form.paymentPreference}
                  onChange={(e) =>
                    updateField("paymentPreference", e.target.value)
                  }
                >
                  <option value="">Select one</option>
                  <option value="zoho_checkout">Zoho Checkout</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="cashier">Cashier’s Check</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>How did you hear about us?</label>
                <input
                  value={form.hearAboutUs}
                  onChange={(e) =>
                    updateField("hearAboutUs", e.target.value)
                  }
                  placeholder="Example: Facebook, referral, website, GoodDog, etc."
                />
              </div>
            </div>

            <div className="field">
              <label>Ready to place deposit?</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="readyDeposit"
                    value="yes"
                    checked={form.readyToPlaceDeposit === "yes"}
                    onChange={() =>
                      updateField("readyToPlaceDeposit", "yes")
                    }
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="readyDeposit"
                    value="no"
                    checked={form.readyToPlaceDeposit === "no"}
                    onChange={() =>
                      updateField("readyToPlaceDeposit", "no")
                    }
                  />
                  No
                </label>
              </div>
            </div>

            <div className="field">
              <label>
                Please input any questions that you may have here.
              </label>
              <textarea
                rows={3}
                value={form.questions}
                onChange={(e) =>
                  updateField("questions", e.target.value)
                }
              />
            </div>
          </section>

          {/* SECTION 5: TERMS & CONDITIONS */}
          <section className="card">
            <h2>Terms and Conditions</h2>
            <p className="small">
              Please review these Terms and Conditions. This is the same
              content you provide with your Southwest Virginia Chihuahua
              adoption process.
            </p>

            <div className="terms-scroll">
              {/* (Same Terms text as before – shortened here for space, but
                  this block is exactly what you sent, just wrapped into
                  paragraphs. */}
              <h3>1. Application Process</h3>
              <p>
                1.1 Incomplete or Incorrect Information – You agree to
                provide complete, accurate, and truthful information in
                your application. Providing false, incomplete, or
                misleading information may result in immediate
                disqualification of your application or rehoming of the
                puppy at our sole discretion.
              </p>
              <p>
                1.2 Non-Binding Application – Submission of an application
                does not guarantee approval or reservation of any puppy.
                All applications are subject to Breeder review and
                approval. We reserve the right, in our sole discretion, to
                accept or reject any application for any reason.
              </p>
              <p>
                1.3 Application Fee – As of the date of this application,
                there is no separate application fee. However, once an
                application is approved, a nonrefundable $250 deposit will
                be required to reserve the puppy.
              </p>

              <h3>2. Deposit and Reservation</h3>
              <p>
                2.1 Deposit Requirement – If your application is approved,
                we will provide you with a link to pay a nonrefundable
                $250 deposit (“Deposit”). Your puppy will be reserved once
                we receive cleared payment of this Deposit.
              </p>
              <p>
                2.2 Nonrefundable Nature of Deposit – Under no
                circumstances will the Deposit be refunded. The Deposit
                covers part of our administrative and care costs incurred
                to date (e.g., vaccinations, deworming, health checks,
                socialization, and documentation).
              </p>
              <p>
                2.3 Reservation Period – Upon receipt of the Deposit, the
                puppy will be marked as “Reserved” in our records. If you
                do not complete the remaining balance by the deadline, the
                reservation may be forfeited.
              </p>

              <h3>3. Approval, Rejection, and Waitlist</h3>
              <p>
                3.1 Approval Criteria – We evaluate applications based on
                household environment, reason for adoption, ability to
                provide lifelong care, and understanding of Chihuahua
                needs.
              </p>
              <p>
                3.2 Right to Reject – We may reject any application at our
                discretion.
              </p>
              <p>
                3.3 Waitlist – You may request to be kept on a waitlist
                for future litters; all applicants are reviewed for each
                litter.
              </p>

              <h3>4. Privacy and Data Use</h3>
              <p>
                4.1 Personal Information – Used only to review/process
                your application, facilitate reservations, and provide
                post-adoption support, except as required by law or to
                complete transactions.
              </p>
              <p>
                4.2 Communications – You consent to email/SMS/phone for
                updates, reminders, and adoption-related communication.
              </p>

              <h3>5. Health Guarantee and Contractual Terms</h3>
              <p>
                5.1 Health Guarantee – Puppies are sold with a limited
                health guarantee as described in the Puppy Sales Agreement
                and Health Guarantee.
              </p>
              <p>
                5.2 Contract Requirement – After paying the Deposit, you
                must sign the Puppy Sales Agreement and Health Guarantee
                via Zoho Sign before any puppy is released.
              </p>

              <h3>6. Ownership Transfer and Delivery</h3>
              <p>
                6.1 Balance Due – Remaining balance plus tax must be paid
                in full before pickup or delivery.
              </p>
              <p>
                6.2 Delivery Options Only – No in-home pickups; all puppies
                are released via scheduled hand-off or transport.
              </p>
              <p>
                6.3 Transfer of Ownership – Ownership transfers after full
                payment and signed contract at the time of delivery.
              </p>

              <h3>7. Post-Approval Responsibilities</h3>
              <p>
                7.1 Veterinary Examination – You agree to a vet exam
                within ten days and to follow the Health Guarantee
                procedure if an issue is found.
              </p>
              <p>
                7.2 Ongoing Care – You agree to provide ongoing
                veterinary care, vaccinations, parasite prevention, and
                proper nutrition.
              </p>
              <p>
                7.3 Lifetime Support & Return Policy – If you can’t keep
                the dog, you will contact us first and offer the dog back
                to us.
              </p>

              <h3>8. Liability and Disclaimers</h3>
              <p>
                8.1 No Warranty Beyond Health Guarantee – The puppy is
                otherwise sold “as is”.
              </p>
              <p>
                8.2 Limitation of Liability – Our liability is limited to
                the remedies described in the Health Guarantee.
              </p>

              <h3>9. Governing Law and Dispute Resolution</h3>
              <p>
                9.1 Governing Law – These Terms are governed by the laws
                of the Commonwealth of Virginia.
              </p>
              <p>
                9.2 Dispute Resolution – You agree to attempt informal
                resolution and, if necessary, mediation, before court.
              </p>

              <h3>10. Miscellaneous</h3>
              <p>
                10.1 Severability – If any part is invalid, the rest
                remains in effect.
              </p>
              <p>
                10.2 No Waiver – No waiver of any term is a continuing
                waiver.
              </p>
              <p>
                10.3 Amendments – We may update these Terms on our
                website; continued use means acceptance.
              </p>

              <p className="terms-bottom">
                By clicking “I Agree” and submitting your application, you
                acknowledge that you have read, understood, and agree to
                be bound by these Terms and Conditions.
              </p>
            </div>

            <div className="field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) =>
                    updateField("termsAccepted", e.target.checked)
                  }
                />{" "}
                I have read and agree to the Terms and Conditions above.
              </label>
            </div>
          </section>

          {/* SECTION 6: APPLICANT DECLARATIONS */}
          <section className="card">
            <h2>Applicant Declarations</h2>
            <p className="small">
              Please read each statement carefully. By checking the box,
              you confirm that the statement is true and that you agree to
              abide by it.
            </p>

            <div className="declarations">
              {DECLARATIONS.map((d) => (
                <label key={d.key} className="decl-item">
                  <div className="decl-header">
                    <input
                      type="checkbox"
                      checked={form.declarations[d.key]}
                      onChange={(e) =>
                        updateDeclaration(d.key, e.target.checked)
                      }
                    />
                    <span className="decl-title">{d.title}</span>
                  </div>
                  <div className="decl-text">{d.text}</div>
                </label>
              ))}
            </div>
          </section>

          {/* SECTION 7: SIGNATURE & SUMMARY */}
          <section className="card">
            <h2>Signature &amp; Summary</h2>

            <div className="grid-2">
              <div className="field">
                <label>Date-Time (when you are signing this)</label>
                <input
                  type="datetime-local"
                  value={form.signedAt}
                  onChange={(e) =>
                    updateField("signedAt", e.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>Signature (type your full name)</label>
                <input
                  value={form.signature}
                  onChange={(e) =>
                    updateField("signature", e.target.value)
                  }
                  placeholder="Type your full name"
                />
              </div>
            </div>

            <div className="summary">
              <h3>Application Summary</h3>
              <div className="summary-grid">
                <div>
                  <h4>Applicant</h4>
                  <p>{form.fullName || "Name not entered"}</p>
                  <p>{form.email || "Email not entered"}</p>
                  <p>{form.phone || "Phone not entered"}</p>
                  <p>
                    {form.city} {form.state && `, ${form.state}`}{" "}
                    {form.zip}
                  </p>
                </div>
                <div>
                  <h4>Puppy Preference</h4>
                  <p>
                    Coat:{" "}
                    {form.preferredCoatType || "No specific preference"}
                  </p>
                  <p>
                    Gender:{" "}
                    {form.preferredGender || "No specific preference"}
                  </p>
                  <p>
                    Color:{" "}
                    {form.colorPreference || "No specific preference"}
                  </p>
                  <p>
                    Interest:{" "}
                    {form.interestType === "current"
                      ? "Current puppy"
                      : form.interestType === "future"
                      ? "Future puppy"
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <h4>Home & Lifestyle</h4>
                  <p>
                    Other pets:{" "}
                    {form.haveOtherPets === "yes"
                      ? "Yes"
                      : form.haveOtherPets === "no"
                      ? "No"
                      : "Not specified"}
                  </p>
                  <p>Home type: {form.homeType || "Not specified"}</p>
                  <p>
                    Fenced yard:{" "}
                    {form.fencedYard === "yes"
                      ? "Yes"
                      : form.fencedYard === "no"
                      ? "No"
                      : "Not specified"}
                  </p>
                  <p>
                    Work status:{" "}
                    {form.workStatus || "Not specified"}
                  </p>
                </div>
                <div>
                  <h4>Declarations</h4>
                  <p>
                    Declarations accepted: {completedDeclarations} /{" "}
                    {totalDeclarations}
                  </p>
                  <p>
                    Terms & Conditions:{" "}
                    {form.termsAccepted ? "Accepted" : "Not accepted"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </section>
        </form>
      </div>

      <style jsx>{`
        .app-root {
          min-height: 100vh;
          background:
            radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),
            radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),
            #020617;
          color: #f9fafb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .app-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 20px 28px;
        }

        .app-header h1 {
          margin: 0 0 4px;
          font-size: 26px;
          font-weight: 700;
        }

        .app-header p {
          margin: 0;
          font-size: 13px;
          color: #9ca3af;
        }

        .banner {
          margin-top: 12px;
          border-radius: 12px;
          padding: 8px 10px;
          font-size: 12px;
        }

        .banner-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.7);
          color: #fecaca;
        }

        .banner-success {
          background: rgba(34, 197, 94, 0.09);
          border: 1px solid rgba(34, 197, 94, 0.7);
          color: #bbf7d0;
        }

        .app-grid {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card {
          border-radius: 20px;
          border: 1px solid #111827;
          background: radial-gradient(
              120% 220% at 0 0,
              rgba(15, 23, 42, 0.8),
              transparent 55%
            ),
            #020617;
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.85);
          padding: 15px 16px 16px;
        }

        .card h2 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .small {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 8px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
        }

        .field label {
          color: #e5e7eb;
          font-size: 12px;
        }

        .req {
          color: #f97316;
        }

        input,
        select,
        textarea {
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #f9fafb;
          padding: 7px 9px;
          font-size: 12px;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #e0a96d;
          box-shadow: 0 0 0 2px rgba(224, 169, 109, 0.3);
        }

        textarea {
          resize: vertical;
        }

        .radio-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
        }

        .radio-row label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .terms-scroll {
          max-height: 260px;
          overflow-y: auto;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #1f2937;
          background: rgba(15, 23, 42, 0.95);
          font-size: 12px;
          line-height: 1.45;
        }

        .terms-scroll h3 {
          margin-top: 10px;
          margin-bottom: 4px;
          font-size: 13px;
        }

        .terms-scroll p {
          margin: 0 0 6px;
        }

        .terms-bottom {
          margin-top: 8px;
          font-style: italic;
        }

        .checkbox-field {
          margin-top: 10px;
        }

        .checkbox-field input[type="checkbox"] {
          margin-right: 6px;
        }

        .declarations {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .decl-item {
          border-radius: 14px;
          border: 1px solid #1f2937;
          padding: 8px 9px;
          background: #020617;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .decl-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
        }

        .decl-title {
          font-size: 13px;
        }

        .decl-text {
          color: #9ca3af;
        }

        .summary {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #1f2937;
        }

        .summary h3 {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          font-size: 12px;
        }

        .summary-grid h4 {
          margin: 0 0 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .summary-grid p {
          margin: 0 0 3px;
          color: #d1d5db;
        }

        .submit-btn {
          margin-top: 12px;
          border-radius: 999px;
          border: 1px solid #1f2937;
          padding: 8px 16px;
          font-size: 13px;
          cursor: pointer;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }

        @media (max-width: 900px) {
          .grid-2 {
            grid-template-columns: minmax(0, 1fr);
          }
          .grid-3 {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 640px) {
          .app-shell {
            padding-inline: 12px;
          }
        }
      `}</style>
    </main>
  );
}
