import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { request } from "http";
import { title } from "process";
import { error } from "console";

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
                title: body.title.trim(),
                abstract: body.abstract ?? null,  // Abstract is optional and default to null
            },
        });

        // Return the created paper
        return NextResponse.json(paper, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}


