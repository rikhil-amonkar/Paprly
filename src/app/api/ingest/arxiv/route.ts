import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { classifyArxiv, fetchArxiv } from "@/lib/arxiv";

// Ingest arXiv paper by id or url
export async function POST(req: NextRequest) {
    try {
        const { input } = await req.json();  // Parse request body
        if (!input || typeof input !== "string" || !input.trim()) {
            return NextResponse.json({ error: "Missing input" }, { status: 400 });  // Validate input
        }

        // Classify the input to determine if it's an arXiv id or url
        const c = await classifyArxiv(input);
        if (c.kind !== "id") {
            return NextResponse.json({ error: "Invalid arXiv id or url" }, { status: 400 });
        }

        // Fetch metadata from arXiv
        const data = await fetchArxiv(c.id);
        if (!data) {
            return NextResponse.json({ error: "Failed to fetch arXiv metadata" }, { status: 500 });
        }

        // Check is paper id is unique
        const existing = await prisma.paper.findUnique({
            where: { arxivId: data.arxivId }
        });
        if (existing) {
            return NextResponse.json({ error: "Paper already added" }, { status: 409 });
        }

        // Check for paper duplicates using upsert
        const paper = await prisma.paper.upsert({
            where: {
                arxivId: data.arxivId
            },  // use arxivId to check for duplicates
            update: {
                title: data.title,
                abstract: data.abstract ?? undefined,
                authors: data.authors.join(", "),
                url: data.url,
                pdfUrl: data.pdfUrl,
                year: data.year,
            },  // update existing record if found
            create: {
                arxivId: data.arxivId,
                title: data.title,
                abstract: data.abstract ?? undefined,
                authors: data.authors.join(", "),
                url: data.url,
                pdfUrl: data.pdfUrl,
                year: data.year,
            },  // create new record if not found
        });

        // Return the ingested paper
        return NextResponse.json(paper, { status: 201 });

    } catch (error: any) {  // catch any errors
        return NextResponse.json({ error: error?.message ?? "Ingest failed" }, { status: 500 });
    }
}