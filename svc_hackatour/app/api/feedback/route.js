// app/api/feedback/route.js
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    // body: { usage, most_liked, to_change }
    const { data, error } = await supabaseServer
      .from("feedback")
      .insert([
        {
          usage: body.usage,
          most_liked: body.most_liked,
          to_change: body.to_change,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { success: true, feedback: data[0] },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { message: "Use POST to submit feedback" },
    { status: 405 }
  );
}
