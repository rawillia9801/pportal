// app/my-puppy/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createRscClient } from "@/lib/supabase/server";
import MyPuppyClient from "./MyPuppyClient";

export default async function MyPuppyPage() {
  const supabase = await createRscClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // We render client-only UI; data loads in the client using the signed-in user.
  return <MyPuppyClient />;
}
