import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client"

// Find all papers from databse
export async function GET() {

    // Order all papers by data created
    const papers = await prisma.paper.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(papers);
}

// Create a new paper to add to table
export async function POST(req: Request) {
    try {

        // Parse the request body
        const body = await req.json();

        // Validate the paper title
        if (!body.title || typeof body.title != "string" || !body.title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });  // Return error if invalid title
        }

        // Insert paper into the database if valid
        const paper = await prisma.paper.create({
            data: {
                arxivId: body.arxivId,
                url: body.url,
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

        // Return the created paper
        return NextResponse.json(paper, { status: 201 });

    } catch (error: unknown) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {

            // Check for duplicate paper saving
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return NextResponse.json(
                    { error: "Paper already saved." },
                    { status: 409 }   // ✅ conflict
                );
            }
        }

        // Check for unknown errors
        console.error("Unexpected error in POST /api/papers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


