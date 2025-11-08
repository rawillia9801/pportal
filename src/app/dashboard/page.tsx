// src/app/dashboard/signout/route.ts
import { NextResponse } from "next/server";
import { createWritableClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createWritableClient();
  await supabase.auth.signOut();
  const url = new URL("/login", new URL(request.url).origin);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const supabase = await createWritableClient();
  await supabase.auth.signOut();
  const url = new URL("/login", new URL(request.url).origin);
  return NextResponse.redirect(url);
}
