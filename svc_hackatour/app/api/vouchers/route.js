// app/api/vouchers/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

function makeCode() {
  // gera código simples (ex: ALPHA-1234)
  const A = Math.random().toString(36).slice(2, 7).toUpperCase();
  const B = Math.floor(1000 + Math.random() * 9000);
  return `${A}-${B}`;
}

export async function GET(req) {
  // lista (últimos 100)
  const { data, error } = await supabaseServer
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vouchers: data }, { status: 200 });
}

export async function POST(req) {
  // cria voucher: body { hotel, provider, guest_email, metadata }
  try {
    const body = await req.json();
    const code = makeCode();
    const insert = {
      code,
      hotel: body.hotel || "Hotel Demo",
      provider: body.provider || "Provider Demo",
      guest_email: body.guest_email || null,
      metadata: body.metadata || {},
    };

    const { data, error } = await supabaseServer
      .from("vouchers")
      .insert([insert])
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ voucher: data[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
