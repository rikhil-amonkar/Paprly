import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PaperContent from "../../[id]/PaperContent";

export default async function ArxivPaperPage({ params }: { params: Promise<{ arxivId: string }> }) {

    // Await params
    const { arxivId } = await params;

    // Set initial paper to null
    let paper = null;

    // Check for arxiv id or db id
    if (!paper) {
        try {

            // Search for paper on backend server API
            const res = await fetch(`${process.env.FASTAPI_URL}/arxiv_paper/${arxivId}`, { cache: "no-store" });  // Ensure fresh fetch

            // If no issues, set paper from results
            if (res.ok) {
                const data = await res.json();
                paper = data && !data.error ? data : null;
            }


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