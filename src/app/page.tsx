// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={wrap}>
      <header style={hero}>
        <h1 style={h1}>My Puppy Portal</h1>
        <p style={tagline}>
          A simple, high-tech home for your Chihuahua adoption journey.
        </p>
      </header>

      <section>
        <h2 style={sectionTitle}>Explore</h2>
        <div style={grid}>
          <Card href="/available-puppies" title="Available Puppies" desc="Browse pups ready for new homes." />
          <Card href="/payments" title="Payments" desc="Pay deposits and balances securely." />
          <Card href="/my-puppy" title="My Puppy" desc="Growth chart, milestones, photos." />
          <Card href="/applications" title="My Applications" desc="Status, approvals, signed documents." />
          <Card href="/messages" title="Messages" desc="Two-way chat with the breeder." />
          <Card href="/health-records" title="Health Records" desc="Vaccines, deworming, microchip." />
          <Card href="/profile" title="Profile" desc="Contact info and preferences." />
          <Card href="/admin" title="Admin Dashboard" desc="Breeder tools (restricted)." />
        </div>
      </section>
    </main>
  );
}

function Card(props: { href: string; title: string; desc: string }) {
  return (
    <Link href={props.href} style={card}>
      <div style={cardTitleRow}>
        <span style={cardTitle}>{props.title}</span>
        <span aria-hidden>→</span>
      </div>
      <p style={cardDesc}>{props.desc}</p>
    </Link>
  );
}

/* ---------- styles (inline objects to avoid styled-jsx) ---------- */
const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at 20% -10%, #f7efe6 0%, #fff 42%, #f8fbff 100%)",
  color: "#1b1f23",
  padding: "36px 20px 64px",
  fontFamily:
    "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif",
};

const hero: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto 18px",
};

const h1: React.CSSProperties = {
  margin: 0,
  fontSize: 44,
  letterSpacing: -0.5,
};

const tagline: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#4a5568",
  maxWidth: 820,
  lineHeight: 1.5,
};

const sectionTitle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "26px auto 10px",
  fontSize: 18,
  color: "#2d3748",
};

const grid: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  display: "block",
  padding: 16,
  borderRadius: 14,
  textDecoration: "none",
  color: "#1b1f23",
  background: "#ffffff",
  border: "1px solid #e6e8eb",
  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
};

const cardTitleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const cardTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
};

const cardDesc: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#556170",
  fontSize: 14,
  lineHeight: 1.45,
};
