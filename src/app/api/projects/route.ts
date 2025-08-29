import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Find all projects from database
export async function GET() {

    // Order all projects by date created
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
}

// Create a new project to add to table
export async function POST(req: Request) {
    try {

        // Parse the request body
        const body = await req.json();

        // Validate the project title
        if (!body.title || typeof body.title != "string" || !body.title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });  // Return error if invalid title
        }

        // Insert project into the database if valid
        const project = await prisma.project.create({
            data: {
                title: body.title.trim(),
                abstract: body.abstract ?? null,  // Abstract is optional and default to null
                theme: body.theme ?? "",  // Default theme is empty string
                contributors: body.contributors ?? ""  // Default contributors is empty string
            },
        });

        // Return the created project
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}