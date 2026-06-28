import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  const letter = String(body.letter || "").trim();
  const deliverOn = body.deliverOn || null;

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Add a valid email." }, { status: 400 });
  }
  if (letter.length === 0) {
    return NextResponse.json({ error: "The letter can't be empty." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("letters").insert({
      email,
      letter,
      deliver_on: deliverOn,
    });

    if (error) {
      console.error("Supabase insert failed:", error.message);
      return NextResponse.json({ error: "Couldn't save your letter. Try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error saving letter:", err);
    return NextResponse.json({ error: "Couldn't save your letter. Try again." }, { status: 500 });
  }
}
