// Protects dashboard and shows a simple welcome
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main style={{padding:24, color:"#e7efff", background:"#0b1423", minHeight:"100vh"}}>
      <h1 style={{margin:"0 0 8px 0"}}>Dashboard</h1>
      <p>Signed in as <strong>{user.email}</strong></p>
    </main>
  );
}
