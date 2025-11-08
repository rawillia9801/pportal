// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // back-compat alias

export default async function Dashboard() {
  const supabase = await createClient(); // <-- await

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main style={{padding:24}}>
      <h1>Dashboard</h1>
      <p>Signed in as: {user.email}</p>
    </main>
  );
}
