import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { error } from "console";

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

        // Call prisma.paper.update() with:
        //    - where: { id: params.id }
        //    - data: include fields from body (title, abstract, etc.)
        const updated = await prisma.paper.update({
            where: { id: Number(id) },
            data: {
                title: body.title,
                abstract: body.abstract,
                problem: body.problem,
                method: body.method,
                results: body.results,
                limitations: body.limitations,
            },
        });

        // Return the updated paper as JSON with status 200
        return NextResponse.json(updated, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

}

// Delete an existng paper
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {

        const { id } = await params;  // Await params

        // Call prisma.paper.delete() with where: { id: params.id }
        await prisma.paper.delete({
            where: { id: Number(id) },
        });

        // Return JSON { success: true }
        return NextResponse.json({ success: true }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}