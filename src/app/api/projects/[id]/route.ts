import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Update details of paper
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {

    // Parse the request body
    try {
        const { id } = await params;  // Await params
        const body = await req.json();

        // Add validation (e.g., if body.title exists, make sure it's not empty)
        if ("title" in body) {
            if (!body.title || typeof body.title != "string" || !body.title.trim()) {
                return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
            }
        }

        // Call prisma.project.update() with:
        const updated = await prisma.project.update({
            where: { id: String(id) },
            data: {
                title: body.title,
                goal: body.goal,
                contributors: body.contributors,
                ideas: body.ideas,
                notes: body.notes,
                related: body.related,
                queue: body.queue
            },
        });

        // Return the updated paper as JSON with status 200
        return NextResponse.json(updated, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

}

// Delete an existng project
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {

        const { id } = await params;  // Await params

        // Call prisma.project.delete() with where: { id: params.id }
        await prisma.project.delete({
            where: { id: String(id) },
        });

        // Return JSON { success: true }
        return NextResponse.json({ success: true }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}