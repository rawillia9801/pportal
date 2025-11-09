// File: /app/signup/page.js (or .tsx)

// --- Server-Side Route Config ---
// These exports NOW work, because this is a Server Component
// (no "use client")
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// --- Component ---
import SignupForm from "./SignupForm"; // Import the client part

// This is the server page
export default function SignupPage() {
  // This component renders on the server.
  // It tells the browser to load and render the SignupForm.
  return <SignupForm />;
}