"use client";

import { useState } from "react";
import { Paper } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Plus, Lightbulb, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaperContent({ paper }: { paper: Paper }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Handle summarization of text
    async function handleSummarize() {

        // Check if abstract exists
        if (!paper.abstract) return;

        setLoadingSummary(true);  // Set loading state

        try {

            const res = await fetch(`/api/summarize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: paper.abstract, max_length: 150 }),  // Adjust max_length as needed
            });

            // Check for summarization error
            if (!res.ok) {
                throw new Error("Summarization failed");
            }

            // Get summary from response
            const data = await res.json();
            setSummary(data.summary ?? "")  // Set summary

        } catch (error: any) {  // Catch any errors
            console.error("Error during summarization:", error);
            setSummary(null);  // Reset summary
        } finally {
            setLoadingSummary(false);  // Reset loading state
        }
    }

    return (

        <div className="max-w-[7000px] mx-auto px-8 space-y-6 pt-28">

            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold heading-carved leading-tight">
                    {paper.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-gray-500">
                    <span>{paper?.contributors}</span>
                    <span>{" • "}</span>
                    <span>{paper?.datePublished?.slice(0, 10)}</span>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">

                    <Button size="sm" className="bg-gray-700 text-white hover:bg-gray-500">
                        <Download className="w-4 h-4 mr-2" />
                        Export BibTeX
                    </Button>
                    <Button size="sm" className="hover:bg-gray-200" variant="outline">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Export Markdown
                    </Button>
                    <Button size="sm" className="hover:bg-gray-200" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Project
                    </Button>
                    <Button size="sm" className="hover:bg-gray-200" variant="outline">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate Ideas
                    </Button>
                    <Button size="sm" className="hover:bg-gray-200" variant="outline">

                        {/* External link */}
                        <a
                            href={`http://arxiv.org/pdf/${paper?.arxivId}` || paper?.url}  // PDF or default home
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                        </a>

                    </Button>

                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Abstract */}
                    <Card
                        className={[
                            "bg-white rounded-xl shadow-md",
                            "flex flex-col transition-transform",
                            "transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl",
                        ].join(" ")}
                    >

                        <CardContent>
                            {paper.abstract && (
                                <section className="mt-6">
                                    <h2 className="font-semibold">Abstract</h2>
                                    <p>{paper.abstract}</p>

                                    {/* Summarize abstract */}
                                    <div className="mt-4">
                                        <Button
                                            onClick={handleSummarize}
                                            disabled={loadingSummary}
                                            className="bg-blue-500 text-white hover:bg-blue-400"
                                        >
                                            {loadingSummary ? "Summarizing..." : "Summarize Abstract"}
                                        </Button>
                                    </div>

                                    {summary && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold">AI-Generated Summary</h3>
                                            <p>{summary}</p>
                                        </div>
                                    )}
                                </section>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    <Card
                        className={[
                            "bg-white rounded-xl shadow-md",
                            "flex flex-col transition-transform",
                            "transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl",
                        ].join(" ")}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg heading-carved">Paper Sections</CardTitle>
                        </CardHeader>
                    </Card>

                    {/* Generated Ideas */}
                    <Card
                        className={[
                            "bg-white rounded-xl shadow-md",
                            "flex flex-col transition-transform",
                            "transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl",
                        ].join(" ")}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg heading-carved flex items-center">
                                <Lightbulb className="w-5 h-5 mr-2 text-primary-accent" />
                                Experiment Ideas
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Metadata */}
                    <Card
                        className={[
                            "bg-white rounded-xl shadow-md",
                            "flex flex-col transition-transform",
                            "transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl",
                        ].join(" ")}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg heading-carved">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Methods</h4>
                            </div>

                        </CardContent>
                    </Card>

                </div>

            </div>

        </div>
    );

}