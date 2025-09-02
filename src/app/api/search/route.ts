export const runtime = "nodejs";

import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function GET(req: Request) {
    try {

        // Parse query params
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const max = Number(searchParams.get("max") ?? "5");  // Max query (default = 5)

        // Forward request to FastAPI backend
        const upstream = await fetch(`${FASTAPI_URL}/arxiv_search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // match your FastAPI Pydantic model
            body: JSON.stringify({
                query: q,
                max_results: max,
                sort_by: "SubmittedDate",
                sort_order: "Descending",
            }),
            cache: "no-store",
        });

        // Return response from FastAPI backend
        const data = await upstream.json();
        return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
        return NextResponse.json({ error: String(err) }, { status: 500 });  // Catch errors
    }
}
