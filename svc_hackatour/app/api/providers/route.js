// app/api/providers/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    // body: { name, category, description, contact, is_premium }
    const { data, error } = await supabaseServer
      .from("providers")
      .insert([
        {
          name: body.name,
          category: body.category,
          description: body.description,
          contact: body.contact,
          is_premium: body.is_premium ?? false,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { success: true, provider: data[0] },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { message: "Use POST to create provider" },
    { status: 405 }
  );
}
