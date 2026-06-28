import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/resend";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: dueLetters, error } = await supabase
    .from("letters")
    .select("id, email, letter, deliver_on")
    .eq("sent", false)
    .lte("deliver_on", today);

  if (error) {
    console.error("Supabase read failed:", error.message);
    return NextResponse.json({ error: "Couldn't load letters." }, { status: 500 });
  }

  const resend = getResend();
  const results = [];

  for (const row of dueLetters || []) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: row.email,
        subject: "A letter from your past self",
        text: row.letter,
      });

      await supabase.from("letters").update({ sent: true }).eq("id", row.id);
      results.push({ id: row.id, status: "sent" });
    } catch (err) {
      console.error(`Failed to send letter ${row.id}:`, err);
      results.push({ id: row.id, status: "failed" });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}