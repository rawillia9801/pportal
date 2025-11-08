import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main style={{padding:24, color:"#e7efff", background:"#0b1423", minHeight:"100vh"}}>
      <h1>My Profile</h1>
      <p>Email: {user.email}</p>
    </main>
  );
}
