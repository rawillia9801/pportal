/* ============================================
   CHANGELOG
   - 2025-11-08: AI Agent API with Supabase tools
   ANCHOR: AGENT_API
   ============================================ */
import { NextRequest, NextResponse } from "next/server";
import { createWritableClient } from "@/lib/supabase/server";

// Generic LLM config: set env in Vercel
const LLM_API_URL   = process.env.LLM_API_URL   || "https://api.openai.com/v1/chat/completions";
const LLM_API_KEY   = process.env.LLM_API_KEY   || process.env.OPENAI_API_KEY!;
const LLM_MODEL     = process.env.LLM_MODEL     || process.env.OPENAI_MODEL || "gpt-4o-mini";

export const dynamic = "force-dynamic";

type ChatMsg = { role: "system"|"user"|"assistant"|"tool"; content: string; name?: string };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages: ChatMsg[] = Array.isArray(body?.messages) ? body.messages : [];

  const supabase = await createWritableClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ---- Tools the model can call ----
  const tools = [
    {
      type: "function",
      function: {
        name: "list_available_puppies",
        description: "List currently available puppies. Default to READY status and limit 12.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 50 },
            status: { type: "string", enum: ["READY","RESERVED","SOLD"] }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_my_application_status",
        description: "Get application status for the signed-in user.",
        parameters: { type: "object", properties: {} }
      }
    },
    {
      type: "function",
      function: {
        name: "send_message_to_breeder",
        description: "Write a message to the breeder from this user.",
        parameters: {
          type: "object",
          properties: { text: { type: "string" } },
          required: ["text"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_payment_link",
        description: "Generate a link to the portal payments page (no invoice creation).",
        parameters: {
          type: "object",
          properties: { note: { type: "string", description: "Context for the payment, e.g., deposit" } }
        }
      }
    }
  ];

  // ---- System prompt (traditional + forward-looking, buyer-facing; no admin) ----
  const system: ChatMsg = {
    role: "system",
    content:
`You are the AI assistant for Southwest Virginia Chihuahua (SWVA Chihuahua).
Priorities: be courteous, clear, and accurate. Respect privacy. Never expose admin tools or change data.
If asked to create invoices, edit contracts, or access admin dashboards, decline and offer to message the breeder instead.

Capabilities via tools:
- list_available_puppies: read-only listing with DOB, gender, price, coat, registry, status.
- get_my_application_status: read-only status of the signed-in buyer's application(s).
- send_message_to_breeder: insert a message from this user to the breeder.
- create_payment_link: return the portal payments URL only (no direct charges).

When listings are shown, summarize in plain language and include key fields.`
  };

  // ---- First LLM call: allow tool choice ----
  const first = await callLLM([system, ...messages], tools, "auto");
  const toolCalls = first?.tool_calls ?? [];

  let toolResults: ChatMsg[] = [];
  for (const tc of toolCalls) {
    const name = tc.function.name;
    const args = safeJson(tc.function.arguments);

    try {
      if (name === "list_available_puppies") {
        const limit = clampNumber(args?.limit ?? 12, 1, 50);
        const status = (args?.status ?? "READY") as string;
        const { data, error } = await supabase
          .from("puppies")
          .select("id,name,gender,price,coat_type,registry,status,dob,ready_date,weight_birth,projected_adult_weight")
          .eq("status", status)
          .order("ready_date", { ascending: true })
          .limit(limit);
        if (error) throw error;
        toolResults.push({
          role: "tool",
          name,
          content: JSON.stringify({ ok: true, results: data ?? [] })
        });
      } else if (name === "get_my_application_status") {
        const { data, error } = await supabase
          .from("applications")
          .select("id,created_at,status,puppy_id,notes")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        if (error) throw error;
        toolResults.push({ role: "tool", name, content: JSON.stringify({ ok: true, results: data ?? [] }) });
      } else if (name === "send_message_to_breeder") {
        const text: string = (args?.text ?? "").toString().slice(0, 2000);
        if (!text) throw new Error("Empty message");
        const { error } = await supabase.from("messages").insert({
          author_id: user.id,
          author_email: user.email,
          body: text
        });
        if (error) throw error;
        toolResults.push({ role: "tool", name, content: JSON.stringify({ ok: true, sent: true }) });
      } else if (name === "create_payment_link") {
        const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const url = `${base}/payments`;
        toolResults.push({ role: "tool", name, content: JSON.stringify({ ok: true, url }) });
      }
    } catch (e: any) {
      toolResults.push({ role: "tool", name, content: JSON.stringify({ ok: false, error: e.message || "Tool failed" }) });
    }
  }

  // ---- Second call: have the model answer using tool outputs ----
  const final = await callLLM(
    [system, ...messages, ...(toolResults as any)],
    tools,
    "none"
  );

  return NextResponse.json({ reply: final?.content ?? "Done." });
}

/* ===== helpers ===== */
function safeJson(s: any) {
  if (typeof s === "object") return s;
  try { return JSON.parse(String(s || "{}")); } catch { return {}; }
}
function clampNumber(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number(n)));
}

async function callLLM(msgs: ChatMsg[], tools: any[], toolChoice: "auto" | "none") {
  const res = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: msgs,
      tools,
      tool_choice: toolChoice === "none" ? "none" : "auto",
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM HTTP ${res.status}: ${t}`);
  }
  const data = await res.json();

  // OpenAI /v1/chat format
  const choice = data?.choices?.[0]?.message;
  return choice || { content: "I’m here to help." };
}
