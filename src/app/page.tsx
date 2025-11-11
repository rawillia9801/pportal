// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div style={shell}>
      {/* Sidebar tabs (links) */}
      <aside style={side}>
        <div style={brand}>
          <div style={brandTop}>My Puppy</div>
          <div style={brandSub}>Portal</div>
        </div>

        <nav style={nav}>
          <NavItem href="/available-puppies" label="Available Puppies" />
          <NavItem href="/payments" label="Payments" />
          <NavItem href="/my-puppy" label="My Puppy" />
          <NavItem href="/applications" label="My Applications" />
          <NavItem href="/messages" label="Messages" />
          <NavItem href="/health-records" label="Health Records" />
          <NavItem href="/profile" label="Profile" />
          <div style={divider} />
          <NavItem href="/admin" label="Admin Dashboard" subtle />
        </nav>

        <footer style={foot}>
          <small style={{ opacity: 0.85 }}>
            © {new Date().getFullYear()} Southwest Virginia Chihuahua
          </small>
        </footer>
      </aside>

      {/* Content preview (homepage) */}
      <main style={main}>
        <header style={hero}>
          <h1 style={h1}>My Puppy Portal</h1>
          <p style={sub}>
            Secure customer portal for applications, payments, documents,
            messaging, and real-time puppy updates.
          </p>
        </header>

        <section style={previewWrap}>
          <PreviewCard
            title="Everything in One Place"
            text="Track your application, sign agreements, make payments, and follow your Chihuahua’s growth—organized and accessible from any device."
          />
          <PreviewCard
            title="Professional & Transparent"
            text="Clear status updates, immutable records, and secure messaging keep the adoption process smooth, documented, and stress-free."
          />
          <PreviewCard
            title="High-Tech, Human Touch"
            text="Automated reminders and smart timelines, backed by a responsive breeder who cares about every detail."
          />
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={sectH2}>Quick Links</h2>
          <div style={linkGrid}>
            <QuickLink href="/available-puppies" title="Browse Puppies" />
            <QuickLink href="/payments" title="Make a Payment" />
            <QuickLink href="/my-puppy" title="View My Puppy" />
            <QuickLink href="/applications" title="My Applications" />
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------- small helpers -------------------- */
function NavItem({
  href,
  label,
  subtle,
}: {
  href: string;
  label: string;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        ...navItem,
        ...(subtle ? { opacity: 0.9 } : null),
      }}
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}

function PreviewCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} style={quickLink}>
      <span>{title}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}

/* -------------------- styles -------------------- */
const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  background:
    "linear-gradient(180deg, #f4f8ff 0%, #ffffff 55%, #f8f5ff 100%)",
  color: "#141821",
  fontFamily:
    "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif",
};

const side: React.CSSProperties = {
  position: "sticky",
  top: 0,
  alignSelf: "start",
  height: "100vh",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  padding: 16,
  // FIX: solid, non-fading background for perfect contrast
  background: "linear-gradient(180deg, #0f1326 0%, #141b30 100%)",
  color: "white",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
};

const brand: React.CSSProperties = { lineHeight: 1, margin: "4px 4px 12px" };
const brandTop: React.CSSProperties = { fontWeight: 800, fontSize: 24, letterSpacing: 0.2 };
const brandSub: React.CSSProperties = { fontWeight: 700, fontSize: 18, opacity: 0.92 };

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 8,
};

const navItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "12px 14px",
  borderRadius: 12,
  textDecoration: "none",
  color: "#eaf0ff",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  transition: "transform .06s ease, background .15s ease, border .15s ease",
} as const;

const divider: React.CSSProperties = {
  height: 1,
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)",
  margin: "6px 4px",
};

const foot: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.10)",
  paddingTop: 10,
  marginTop: 12,
  color: "#d7defc",
};

const main: React.CSSProperties = {
  padding: "32px 28px 48px",
};

const hero: React.CSSProperties = {
  padding: "6px 0 14px",
  borderBottom: "1px solid #e9ecf3",
  marginBottom: 12,
};

const h1: React.CSSProperties = {
  margin: 0,
  fontSize: 42,
  letterSpacing: -0.5,
};

const sub: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#4a566d",
  maxWidth: 900,
  lineHeight: 1.5,
};

const previewWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
  marginTop: 16,
};

const card: React.CSSProperties = {
  padding: 16,
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #e6e9f2",
  boxShadow: "0 1px 2px rgba(14, 28, 45, 0.06)",
  minHeight: 120,
};

const cardTitle: React.CSSProperties = { margin: "0 0 6px", fontSize: 16, fontWeight: 700 };
const cardText: React.CSSProperties = { margin: 0, color: "#59657a", lineHeight: 1.55 };

const sectH2: React.CSSProperties = { margin: "18px 0 10px", fontSize: 18, color: "#2b3446" };

const linkGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const quickLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 14,
  borderRadius: 12,
  color: "#0d1530",
  textDecoration: "none",
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  border: "1px solid #dfe6f4",
  boxShadow: "0 1px 2px rgba(14, 28, 45, 0.05)",
};
