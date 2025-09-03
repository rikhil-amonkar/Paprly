"use client";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Typewriter } from "react-simple-typewriter";
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

    // Function to delete a paper
    async function deletePaper(dbId: string, arxivId?: string) {

        // Confirm if user wants to delete selected paper
        if (!confirm("Delete this paper?")) return;

        const res = await fetch(`/api/papers/${dbId}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            alert(j.error ?? "Delete failed");
            return;
        }

        // Remove the id of the previous paper (the one being deleted) from the UI and list
        setPapers(prev => prev.filter(p => p.id !== dbId));
        if (arxivId) {
            setBookmarkedIds(prev => {
                const next = new Set(prev);
                next.delete(arxivId);
                return next;
            });
        }

        // Force search results to re-render with updated state
        setSearchResults(prev =>
            prev.map(p => ({
                ...p,
                isBookmarked: p.arxivId ? bookmarkedIds.has(p.arxivId) : false
            }))
        )
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

            // Update search result states right away
            setSearchResults(
                arr.map((r: any) => ({
                    id: r.id,
                    arxivId: r.id,
                    url: r.url,
                    title: r.title,
                    abstract: r.abstract ?? null,
                    contributors: r.contributors ?? null,
                    datePublished: r.datePublished ?? null,
                    problem: r.problem ?? null,
                    method: r.method ?? null,
                    results: r.results ?? null,
                    limitations: r.limitations ?? null,
                }))
            );

        } catch (error: any) {  // Catch any errors
            setSearchError(error.message || "Search failed");
        } finally {
            setSearching(false);  // Reset searching state
        }
    }

    // Handle bookmarks by id of paper
    const paperKey = (p: Paper) => (p.arxivId || p.url || "");
    const isBookmarked = (p: Paper) =>
        p.arxivId ? bookmarkedIds.has(p.arxivId) : false;

    // Bookmark paper (save to the library)
    async function toggleBookmark(p: Paper) {
        const key = paperKey(p);
        if (!key) return;

        // Check for duplicates
        if (isBookmarked(p)) {

            // Already bookmarked → delete
            const saved = papers.find(b => b.arxivId === p.arxivId);
            if (saved) {
                await deletePaper(saved.id, saved.arxivId);
            }

        } else {
            // Only POST if not already saved
            const res = await fetch(`/api/papers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...p,
                    arxivId: p.arxivId || p.id  // Normalize
                }),
            });

            if (res.status == 409) {
                // Show user-friendly message indicating duplicate
                alert("This paper is already saved in your bookmarks.");
                return;
            }

            // Catch errors
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                console.error("Save failed", j.error);
                return;
            }

            // If all checks pass, bookmark new paper 
            setBookmarkedIds(prev => new Set(prev).add(key));
            load();
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
                                onDelete={() => deletePaper(p.id, p.arxivId)}  // For delete case
                            />

                        ))}
                    </div>

                </div>
            </div>

        </main>

    );
}



