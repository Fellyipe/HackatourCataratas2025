// app/api/vouchers/validate/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function POST(req) {
  // body { code }
  try {
    const { code } = await req.json();
    if (!code)
      return NextResponse.json({ error: "Missing code" }, { status: 400 });

    // busca voucher
    const { data: found, error: selError } = await supabaseServer
      .from("vouchers")
      .select("*")
      .eq("code", code)
      .limit(1);

    if (selError)
      return NextResponse.json({ error: selError.message }, { status: 500 });
    if (!found || found.length === 0)
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });

    const voucher = found[0];
    if (voucher.used)
      return NextResponse.json(
        { error: "Voucher already used", used: true },
        { status: 400 }
      );

    // marca como usado
    const { data, error: updError } = await supabaseServer
      .from("vouchers")
      .update({ used: true })
      .eq("id", voucher.id)
      .select();

    if (updError)
      return NextResponse.json({ error: updError.message }, { status: 500 });

    return NextResponse.json(
      { success: true, voucher: data[0] },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
