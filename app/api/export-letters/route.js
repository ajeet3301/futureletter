import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// This is an owner-only utility, not part of the public site. It is
// protected by a shared secret so letters stay private — anyone without
// the key gets a 401, even if they find this URL.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!process.env.EXPORT_SECRET || key !== process.env.EXPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("letters")
    .select("email, letter, deliver_on, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase read failed:", error.message);
    return NextResponse.json({ error: "Couldn't load letters." }, { status: 500 });
  }

  const rows = (data || []).map((row) => ({
    Email: row.email,
    Letter: row.letter,
    "Read again on": row.deliver_on || "",
    "Written on": new Date(row.created_at).toISOString(),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 28 }, { wch: 60 }, { wch: 16 }, { wch: 22 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Letters");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=futureletter-export.xlsx",
    },
  });
}
