// app/admin/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createRscClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createRscClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div style={{ padding: 24, color: "#e7efff" }}>
      <h1 style={{ margin: 0, fontSize: 32 }}>Admin Dashboard</h1>
      <p>Wired and loading dynamically.</p>
    </div>
  );
}