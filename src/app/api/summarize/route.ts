export const runtime = "nodejs"; // IMPORTANT: Edge can't call localhost

import { NextResponse } from "next/server";
const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

// Proxy POST requests to FastAPI
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Forward the request to FastAPI
        const res = await fetch(`${FASTAPI_URL}/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const text = await res.text();

        if (!res.ok) {
            // Surface FastAPI error body directly
            return NextResponse.json(
                { error: "FastAPI error", status: res.status, body: text },
                { status: res.status }
            );
        }

        // If FastAPI returned JSON, echo it
        return NextResponse.json(JSON.parse(text), { status: 200 });
    } catch (e: any) {
        // Bubble the actual exception message
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
