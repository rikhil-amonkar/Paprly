"use client";
import { METHODS } from "http";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

// Import papercard format (standardized)
import { Paper } from "@/types/paper";
import PaperCard from "@/components/PaperCard";

const SearchIcon = dynamic(() => import("lucide-react").then(m => m.Search), {
    ssr: false,
});

// **** Routing Componenets ****

// Default home function to run frontend and routes
export default function Home() {

    // Define state variables (paper, title, abstract) -> then states (loading, saving, error)
    const [papers, setPapers] = useState<Paper[]>([]);  // Start with empty paper list
    const [loading, setLoading] = useState(true);  // Screen should start loading
    const [error, setError] = useState<string | null>(null);

    // View paper and summary states
    const [viewPaper, setViewPaper] = useState<Paper | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Query and search result states
    const [query, setQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Paper[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Save papers (bookmark)
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<String>>(new Set());

    // Fetch all the papers
    async function load() {

        // Set initial states
        setLoading(true);
        setError(null);

        // Fetch the papers
        try {
            const res = await fetch("/api/papers", { cache: "no-store" });
            const data: Paper[] = await res.json();  // Convert data into json format

            // Update paper state
            setPapers(data);
            setBookmarkedIds(new Set(data.map(paperKey).filter(Boolean)));  // Seed bookmarked set from library

        } catch (error) {
            setError("Failed to load papers.");
        } finally {
            setLoading(false);
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

    // Search arXiv function (using API)
    async function handleSearch(e: React.FormEvent) {

        // Prevent default form submission
        e.preventDefault();
        const q = query.trim();  // Trim whitespace
        if (!q) return;  // Do nothing if query is empty

        // Set searching states
        setSearching(true);
        setSearchError(null);
        setSearchResults([]);

        // Fetch search results from API
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&max=5`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            // Check for search error
            if (!res.ok) {
                throw new Error("Search failed");
            }
            const data = await res.json();
            const arr: any[] = Array.isArray(data) ? data : data.results ?? [];  // Update search results state (ensure array)
            setSearchResults(arr);
        } catch (error: any) {  // Catch any errors
            setSearchError(error.message || "Search failed");
        } finally {
            setSearching(false);  // Reset searching state
        }
    }

    // Handle bookmarks by id of paper
    const paperKey = (p: Paper) => (p.id || p.url || "");
    const isBookmarked = (p: Paper) => bookmarkedIds.has(paperKey(p));

    // Bookmark paper (save to the library)
    async function toggleBookmark(p: Paper) {
        const key = paperKey(p);
        if (!key) return;

        // Delete duplicates from database
        if (isBookmarked(p)) {
            await fetch(`/api/papers/${p.id}`, { method: "DELETE" });
            setBookmarkedIds(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
            setPapers(curr => curr.filter(b => paperKey(b) != key));
        } else {
            await fetch(`/api/papers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(p),
            });
            setBookmarkedIds(prev => new Set(prev).add(key));
            load();  // Reload the backend (instead of manual push)
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
                            "Explore Trending Research Papers",
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

                <p className="text-gray-400 text-lg font-medium">AI-powered research discovery with experiment ideation, contradiction detection, and automated literature reviews.</p>

                {/* Form component for arXiv paper search (API) */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">

                    {/* Input field for arXiv URL */}
                    <div
                        className={[
                            "relative transform hover:-translate-y-1 transition-transform",
                            "transition-shadow duration-200 shadow-md hover:shadow-xl"
                        ].join(" ")}
                    >
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 text-gray-400" />
                        <Input
                            className="pl-12 h-12 text-lg bg-card text-gray-700"
                            placeholder="Search for papers, authors, or topics on arXiv (e.g. quantum computing)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center">

                        {/* Button to search arXiv API */}
                        <Button
                            type="submit"
                            disabled={searching || !query.trim()}
                            className={[
                                "w-40 bg-blue-400 text-white font-semibold",
                                "hover:bg-blue-300 transition-colors mt-6 transform",
                                "transition-transform duration-200 hover:scale-105"
                            ].join(" ")}
                        >
                            {searching ? "Searching..." : "Search arXiv"}
                        </Button>

                    </div>

                    {/* Handle search errors */}
                    {searchError && (
                        <div className="text-sm text-red-600 text-center mt-2">Error: {searchError}</div>
                    )}
                </form>
            </div>

            {/* Div component for arXiv search list */}
            {searchResults.length > 0 && (
                <section className="mb-12">
                    <h1 className="pb-2 mt-6 text-gray-700 text-3xl font-semibold">Search Results</h1>

                    {/* Grid for search results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                        {searchResults.map((p, i) => (

                            // Standardized paper card (searching)
                            <PaperCard
                                key={p.id || p.url || i}
                                paper={p}
                                isBookmarked={isBookmarked(p)}
                                onToggleBookmark={toggleBookmark}  // For bookmarked case
                                onViewDetails={viewPaperDetails}  // For viewing paper details
                            />

                        ))}
                    </div>
                </section>
            )}

            {/* Div component for saved papers */}
            <div className="bg-transparent">
                <h1 className="mt-6 text-gray-700 text-3xl font-semibold pb-2">Bookmarked Papers</h1>
                <div className="mt-4">

                    {/* Status messages */}
                    {loading && <div className="text-sm text-muted-foreground text-gray-700 justify-center text-center">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {!loading && papers.length == 0 && (
                        <div className="text-sm text-muted-foreground text-gray-700 justify-center text-center">No papers bookmarked.</div>
                    )}

                    {/* Grid for papers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                        {papers.map((p, i) => (

                            // Standardized paper card (saved papers)
                            <PaperCard
                                key={p.id || p.url || i}
                                paper={p}
                                isBookmarked={isBookmarked(p)}
                                onDelete={deletePaper}  // For delete case
                                onViewDetails={viewPaperDetails}  // For viewing paper details
                            />

                        ))}
                    </div>
                </div>
            </div>

            {/* Dialog for viewing paper details (outside of list of each paper) */}
            <Dialog open={!!viewPaper} onOpenChange={(open) => { if (!open) closePaperDetails(); }}>
                <DialogContent className="w-full max-w-5xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-700">
                            {viewPaper?.title}
                        </DialogTitle>
                        <p className="text-gray-500">{viewPaper?.datePublished}</p>
                        <p className="text-gray-500">{viewPaper?.contributors}</p>
                    </DialogHeader>

                    {/* Paper details content */}
                    <div className="space-y-4 text-gray-700">

                        {viewPaper?.abstract && (
                            <div>
                                <h3 className="font-semibold">Abstract</h3>
                                <p className="text-gray-700">{viewPaper.abstract}</p>
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
                        {viewPaper?.id && (
                            <a href={`http://arxiv.org/abs/${viewPaper.id}` || "#"} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Open</span>
                            </a>
                        )}
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </main>

    );
}



