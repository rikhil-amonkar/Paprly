import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client"

// Find all papers from databse
export async function GET(req: Request) {

    // Return some object for arxiv papers to prevent null
    const { searchParams } = new URL(req.url)
    const arxivId = searchParams.get("arxivId")

    if (arxivId) {
        const normalized = arxivId.replace(/v\d+$/, ""); // strip version
        const paper = await prisma.paper.findFirst({
            where: {
                OR: [
                    { arxivId },
                    { arxivId: normalized },
                ],
            },
        });
        return NextResponse.json(paper ?? {});
    }

    // Order all papers by data created
    const papers = await prisma.paper.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(papers);
}

// Create a new paper to add to table
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rawId = body.arxivId;
        if (!rawId || typeof rawId !== "string") {
            return NextResponse.json({ error: "arxivId is required" }, { status: 400 });
        }

        const arxivId = rawId.replace(/v\d+$/, ""); // normalize
        if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Idempotent write
        const paper = await prisma.paper.upsert({
            where: { arxivId },         // requires @unique
            update: {},                 // nothing to update for now
            create: {
                arxivId,
                url: body.url ?? null,
                title: body.title.trim(),
                abstract: body.abstract ?? null,
                contributors: body.contributors ?? null,
                datePublished: body.datePublished ?? null,
                problem: body.problem ?? null,
                method: body.method ?? null,
                results: body.results ?? null,
                limitations: body.limitations ?? null,
            },
        });

        // 201 on first create, 200 if it already existed (nice to know)
        const status = paper.createdAt.getTime() > Date.now() - 5_000 ? 201 : 200;
        return NextResponse.json(paper, { status });
    } catch (err: any) {
        console.error("Unexpected error in POST /api/papers:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


