"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Bookmark, Trash2 } from "lucide-react";
import { Paper } from "@/types/paper"
import { useRouter } from "next/navigation";

type PaperCardProps = {
    paper: Paper;
    isBookmarked: boolean;
    onToggleBookmark?: (paper: Paper) => void;
    onDelete?: (id: string) => void;
};

// Helper functions

function internalHref(paper: Paper): string | null {
    // Saved papers → DB id
    if (paper.id) {
        return `/mypapers/${paper.id}`;
    }
    // Unsaved search results → arXiv id
    if (paper.arxivId) {
        return `/mypapers/arxiv/${paper.arxivId}`;
    }
    return null;
}

function externalPdfHref(paper: Paper): string {
    if (paper.arxivId) return `https://arxiv.org/pdf/${paper.arxivId}.pdf`;  // Link to arxiv pdf
    if (paper.url) return paper.url;  // Fallback to site if no PDF exists
    return "#";
}

const normalizeArxivId = (id?: string | null) => id?.replace(/v\d+$/, "") ?? "";

// Full standardized papercard look
export default function PaperCard({ paper, isBookmarked, onToggleBookmark, onDelete }: PaperCardProps) {

    // Create a route system for text
    const router = useRouter();

    // Make sure fallback is arxiv route
    const href =
        paper?.id
            ? `/mypapers/${paper.id}`
            : paper?.arxivId
                ? `/mypapers/arxiv/${normalizeArxivId(paper.arxivId)}`
                : null;

    return (
        <div
            key={paper.id || paper.url}
            className="bg-white rounded-xl shadow-md p-5 min-h-[280px] h-full flex flex-col 
                   transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Title */}
            <h3
                className="hover:text-sky-500 text-gray-700 font-semibold cursor-pointer"
                title={paper.title}
                onClick={() => href && router.push(href)}
            >
                {paper.title ?? "Untitled"}
            </h3>

            {/* Metadata */}
            <div className="mt-1 text-sm text-gray-500">
                {paper.datePublished && <span>{"Published: "}{paper.datePublished.slice(0, 10)}</span>}
                {paper.contributors && <span className="line-clamp-1">{paper.contributors}</span>}
            </div>

            {/* Abstract */}
            {
                paper.abstract && (
                    <p className="mt-2 text-sm line-clamp-6 text-gray-700">{paper.abstract}</p>
                )
            }

            <div className="flex-1" />

            {/* Actions */}
            <div className="mt-4 flex gap-2">


                {/* Open link */}
                <Button variant="ghost" className="h-10 hover:bg-gray-100" asChild>
                    <a
                        href={externalPdfHref(paper)}  // PDF or default home
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Open</span>
                    </a>
                </Button>

                {/* Bookmark */}
                <Button
                    variant="ghost"
                    className="h-10 hover:bg-gray-100"
                    onClick={() => onToggleBookmark?.(paper)}
                    disabled={isBookmarked}  // Disable button if already saved
                    aria-label="Bookmark"
                    title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                    <Bookmark
                        className={[
                            "w-4 h-4 transition-colors",
                            isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-gray-500"
                        ].join(" ")}
                    />
                    <span className="text-sm font-medium">{isBookmarked ? "Saved" : "Save"}</span>
                </Button>

                {/* Delete button (only in bookmarked section) */}
                {onDelete && (
                    <Button
                        variant="ghost"
                        className="h-10 text-red-500 hover:bg-gray-100"
                        onClick={() => {
                            if (paper.id) {
                                onDelete(paper.id)
                            }
                        }
                        }
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                    </Button>
                )}

            </div>
        </div >
    );
}