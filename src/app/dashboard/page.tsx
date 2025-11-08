import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main style={{maxWidth:900,margin:"48px auto",padding:24,fontFamily:"system-ui, Segoe UI, Roboto, Inter, Arial, sans-serif"}}>
      <h1 style={{fontSize:28,marginBottom:8}}>Admin Dashboard</h1>
      <p style={{color:"#555"}}>Signed in as <strong>{user.email}</strong></p>
      <ul style={{marginTop:16,lineHeight:1.8,color:"#333"}}>
        <li>Go to <a href="/puppies">Available Puppies</a> (public)</li>
        <li>(Next) Admin pages to add/edit/remove puppies</li>
      </ul>
      <form action="/dashboard/signout" method="post" style={{marginTop:24}}>
        <button type="submit" style={{padding:"8px 12px",border:"1px solid #111",borderRadius:8}}>Sign out</button>
      </form>
    </main>
  );
}
