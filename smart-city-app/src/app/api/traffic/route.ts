import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/events/`, {
    // This runs server-side only, so no CORS issues.
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { detail: "Failed to fetch from backend" },
      { status: 502 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/api/events/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 201 });
}


