export const runtime = "nodejs";

import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function GET(req: Request) {
    try {

        // Parse query params
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const max = parseInt(searchParams.get("max") || "5", 10);  // Max query (default = 5)

        // Initialzie payload body for search info
        let payload: any = {
            query: q,
            max_results: max,
            sort_by: "SubmittedDate",
            sort_order: "Descending",
        };

        // Handle id: special case
        if (q.startsWith("id:")) {
            payload = {
                id_list: q.replace("id:", ""), // strip "id:"
            };
        }

        // Forward request to FastAPI backend
        const upstream = await fetch(`${FASTAPI_URL}/arxiv_search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // match your FastAPI Pydantic model
            body: JSON.stringify(payload),
            cache: "no-store",
        });

        // Return response from FastAPI backend
        const data = await upstream.json();
        return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
        return NextResponse.json({ error: String(err) }, { status: 500 });  // Catch errors
    }
}
