// app/api/time/route.js
import { NextResponse } from "next/server";

export function GET() {
  const now = new Date().toISOString();
  return NextResponse.json({ time: now });
}
