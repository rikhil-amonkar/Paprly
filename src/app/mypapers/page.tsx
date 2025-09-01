"use client";
import { METHODS } from "http";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import dynamic from "next/dynamic";

const SearchIcon = dynamic(() => import("lucide-react").then(m => m.Search), {
    ssr: false,
});

// Empty paper schema
type Paper = {
    id: string;
    title: string;
    abstract?: string | null;
    problem?: string | null;
    method?: string | null;
    result?: string | null;
    url?: string | null;
    limitations?: string | null;
    createdAt: string;
};

// **** Routing Componenets ****

// Default home function to run frontend and routes
export default function Home() {

    // Define state variables (paper, title, abstract) -> then states (loading, saving, error)
    const [papers, setPapers] = useState<Paper[]>([]);  // Start with empty paper list
    const [loading, setLoading] = useState(true);  // Screen should start loading
    const [error, setError] = useState<string | null>(null);
    const [viewPaper, setViewPaper] = useState<Paper | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Fetch all the papers
    async function load() {

        // Set initial states
        setLoading(true);
        setError(null);

        // Fetch the papers
        try {
            const res = await fetch("/api/papers", { cache: "no-store" });
            const data = await res.json();  // Convert data into json format

            // Update paper state
            setPapers(data)

        } catch (error) {
            setError("Failed to load papers.");
        } finally {
            setLoading(false)
        }
    }

    // Runs load() when the page first opens (when paper list starts empty)
    useEffect(() => { load(); }, []);

    // Function to view a paper (opens dialog)
    function viewPaperDetails(paper: Paper) {
        setViewPaper(paper);
        setSummary(null);  // Reset summary when viewing a new paper
    }

    // Function to close the paper view dialog
    function closePaperDetails() {
        setViewPaper(null);
        setSummary(null);  // Reset summary when closing the dialog
    }

    // Function to delete a paper
    async function deletePaper(id: string) {

        // Confirm if user wants to delete selected paper
        if (!confirm("Delete this paper?")) return;

        const res = await fetch(`/api/papers/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            alert(j.error ?? "Delete failed");
            return;
        }

        // Remove the id of the previous paper (the one being deleted) from the UI and list
        setPapers(prev => prev.filter(p => p.id != id));
    }

    // Function for arXiv url input
    const [arXiv, setarXiv] = useState("");
    const [ingesting, setIngesting] = useState(false);

    // Function to ingest paper from arXiv URL
    async function ingestPaper(e: React.FormEvent) {
        e.preventDefault();
        if (!arXiv.trim()) return;
        setIngesting(true);

        // Fetch arXiv URL and specify action
        try {
            const res = await fetch("/api/ingest/arxiv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: arXiv }),
            });

            // Send created paper but check for invalid format
            const created = await res.json();
            if (!res.ok) throw new Error((created as any)?.error || "Ingest failed");

            // Add ingested paper to papers list
            setPapers(prev => [created, ...prev])
            setarXiv("")  // Reset arXiv URL input

        } catch (error: any) {  // Catch any errors
            alert(error.message ?? "Ingest failed");

        } finally {  // Reset ingesting state
            setIngesting(false);
        }
    }

    // Summarize paper function
    async function summarizePaper(paperText: string) {

        setLoadingSummary(true);  // Set loading state

        try {

            const res = await fetch(`/api/summarize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: paperText, max_length: 150 }),  // Adjust max_length as needed
            });

            // Check for summarization error
            if (!res.ok) {
                throw new Error("Summarization failed");
            }

            // Get summary from response
            const data = await res.json();
            return data.summary as string;

        } catch (error: any) {  // Catch any errors
            console.error("Error during summarization:", error);
            return null;
        } finally {
            setLoadingSummary(false);  // Reset loading state
        }
    }

    // **** Front End Componenets ****

    // Return frontend HTML
    return (

        // Main page layout
        <main className="mx-auto max-w-6xl px-6 pt-24 md:pt-28 pb-16">

            <div className="text-center space-y-4 py-8">

                {/* Title for paper search with typewriter effect */}
                <h1 className="text-3xl font-bold text-gray-700">
                    <Typewriter
                        words={[
                            "Find Trending Research Papers",
                            "Add Papers from arXiv",
                            "Create Your Own Summaries with AI",]}
                        loop={0}
                        cursor
                        cursorStyle="_"
                        typeSpeed={60}
                        deleteSpeed={30}
                        delaySpeed={8000}
                    />
                </h1>

                {/* Card component for arXiv url paper add */}
                <form onSubmit={ingestPaper} className="max-w-2xl mx-auto">

                    {/* Input field for arXiv URL */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 text-gray-400" />
                        <Input
                            className="pl-12 h-12 text-lg bg-card text-gray-700"
                            placeholder="arXiv URL (e.g. https://arxiv.org/abs/1234.56789)"
                            value={arXiv}
                            onChange={(e) => setarXiv(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center">

                        {/* Button to submit arXiv URL */}
                        <Button
                            type="submit"
                            disabled={ingesting || !arXiv.trim()}
                            className={[
                                "w-40 bg-blue-400 text-white font-semibold",
                                "hover:bg-blue-300 transition-colors mt-6 transform",
                                "transition-transform duration-200 hover:scale-105"
                            ].join(" ")}
                        >
                            {ingesting ? "Adding..." : "Add arXiv Paper"}
                        </Button>

                    </div>
                </form>
            </div>

            {/* Card component for paper list */}
            <Card className="bg-white shadow-lg rounded-xl">
                <CardContent>
                    <CardTitle className="mt-6 text-gray-700">Library</CardTitle>
                </CardContent>
                <CardContent className="space-y-4">
                    {loading && <div className="text-sm text-muted-foreground text-gray-700">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {!loading && papers.length == 0 && (
                        <div className="text-sm text-muted-foreground text-gray-700">No papers saved.</div>
                    )}
                    <ul className="space-y-3">
                        {papers.map((p) => (
                            <li key={p.id} className="border rounded-lg p-3 hover:bg-accent">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <a
                                            href={p.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline space-y-1 text-gray-700 font-semibold">
                                            {p.title}
                                        </a>
                                        {p.abstract && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 text-gray-700">
                                                {p.abstract}
                                            </p>
                                        )}
                                    </div>

                                    {/* Buttons for paper actions */}
                                    <div>
                                        <Button
                                            variant="ghost"
                                            className="text-md text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                                            onClick={() => viewPaperDetails(p)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-md text-red-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                                            onClick={() => deletePaper(p.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>

                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Dialog for viewing paper details (outside of list of each paper) */}
            <Dialog open={!!viewPaper} onOpenChange={(open) => { if (!open) closePaperDetails(); }}>
                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-700">
                            {viewPaper?.title}
                        </DialogTitle>
                        <p className="text-gray-500">{"arXiv ● "}{viewPaper?.createdAt.slice(0, 10)}</p>
                    </DialogHeader>

                    {/* Paper details content */}
                    <div className="space-y-4 text-gray-700">

                        {viewPaper?.abstract && (
                            <div>
                                <h3 className="font-semibold">Abstract</h3>
                                <p className="whitespace-pre-wrap">{viewPaper.abstract}</p>
                            </div>
                        )}

                        {viewPaper?.problem && (
                            <div>
                                <h3 className="font-semibold">Problem</h3>
                                <p className="whitespace-pre-wrap">{viewPaper.problem}</p>
                            </div>
                        )}

                        {viewPaper?.method && (
                            <div>
                                <h3 className="font-semibold">Method</h3>
                                <p className="whitespace-pre-wrap">{viewPaper.method}</p>
                            </div>
                        )}

                        {viewPaper?.result && (
                            <div>
                                <h3 className="font-semibold">Results</h3>
                                <p className="whitespace-pre-wrap">{viewPaper.result}</p>
                            </div>
                        )}

                        {viewPaper?.limitations && (
                            <div>
                                <h3 className="font-semibold">Limitations</h3>
                                <p className="whitespace-pre-wrap">{viewPaper.limitations}</p>
                            </div>
                        )}

                        {/* Button to summarize abstract using AI */}
                        {loadingSummary && <div className="text-sm text-muted-foreground text-gray-700">Summarizing...</div>}

                        <Button
                            variant="outline"
                            disabled={loadingSummary || !viewPaper?.abstract}
                            className="text-md text-white font-semibold bg-blue-400 hover:bg-blue-300 transition-colors flex text-center h-10"
                            onClick={async () => {
                                if (!viewPaper?.abstract) return;  // Do nothing if no abstract
                                const s = await summarizePaper(viewPaper.abstract);
                                if (s) setSummary(s);  // Set summary state
                            }}
                        >
                            {loadingSummary ? "Summarizing..." : "Summarize Abstract"}
                        </Button>

                        {summary && (
                            <div>
                                <h3 className="font-semibold">AI-Generated Summary</h3>
                                <p className="whitespace-pre-wrap">{summary}</p>
                            </div>
                        )}

                    </div>

                    {/* Dialog footer with arXiv link */}
                    <DialogFooter className="mt-4">
                        {viewPaper?.url && (
                            <div>
                                <a
                                    href={viewPaper.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    View on arXiv
                                </a>
                            </div>
                        )}
                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </main>

    );

}



