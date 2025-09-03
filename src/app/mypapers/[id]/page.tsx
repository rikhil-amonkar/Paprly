import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PaperContent from "./PaperContent";

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {

    // Await params
    const { id } = await params;

    // Find current paper (based on id)
    let paper = await prisma.paper.findUnique({ where: { id } })

    // Check for arxiv id or db id
    if (!paper) {
        try {

            // Search for paper on backend server API
            const res = await fetch(`${process.env.FASTAPI_URL}/api/search?q=id:${id}`);
            const data = await res.json();
            paper = data.results[0] ?? null  // Set paper to first result

        } catch {
            paper = null  // Catch if no paper is found
        }
    }

    // If not found, return error
    if (!paper) return notFound();

    return (

        <PaperContent paper={paper} />
    )

}