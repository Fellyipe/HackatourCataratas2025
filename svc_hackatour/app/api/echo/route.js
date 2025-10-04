// app/api/echo/route.js
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      received: body,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}
