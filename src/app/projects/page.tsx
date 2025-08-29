"use client";
import { METHODS } from "http";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

// Default home function to run frontend and routes
export default function Home() {

    // Define state variables (paper, title, abstract) -> then states (loading, saving, error)
    const [papers, setPapers] = useState<Paper[]>([]);  // Start with empty paper list
    const [title, setTitle] = useState("");  // Start with empty title
    const [abstract, setAbstract] = useState("");  // Start with empty abstract
    const [saving, setSaving] = useState(false);  // Nothing is saved right away
    const [open, setOpen] = useState(false);  // Dialog is closed by default

    // Function to create and add a new paper 
    async function createPaper(e: React.FormEvent) {  // Create a form with React

        e.preventDefault();  // Stops page from reloading when form submits

        // Check for empty title
        if (!title.trim()) {
            setSaving(true);
        }

        // Fetch papers and specify what action is being taken
        try {
            const res = await fetch("api/papers", {
                method: "POST",  // Specify method (posting paper)
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, abstract }),  // Sends JSON format string to backend
            });

            // Send created paper but check for invalid format
            const created: Paper = await res.json();
            if (!res.ok) throw new Error((created as any)?.error || "Created failed");  // Throw an error if creating failed

            // Add paper to papers list
            setPapers(prev => [created, ...prev])  // Adds newest paper to front of list

            // Reset form details
            setTitle("")
            setAbstract("")
            setOpen(false);  // Close dialog box when new paper is added

        } catch (error: any) {  // Catch any errors
            alert(error.message ?? "Create failed");
        } finally {
            setSaving(false);
        }
    }

    return (

        // Main page layout
        <main className="mx-auto max-w-6xl px-6 pt-24 md:pt-28 pb-16">

            {/* Card component for manual paper add */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-700">Your Projects</h1>

                {/* Dialog component for adding a new paper */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gray-700 text-white font-semibold hover:bg-gray-500 my-4">
                            + Add Project
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-gray-700">New Project</DialogTitle>
                        </DialogHeader>

                        {/* Pop-op form for adding a new paper */}
                        <form onSubmit={createPaper} className="grid gap-4 pt-2">
                            <Input
                                className="placeholder-gray-400 text-gray-700"
                                placeholder="Paper title (required)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                className="placeholder-gray-400 text-gray-700"
                                placeholder="Abstract (optional)"
                                rows={5}
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                            />

                            {/* Footer buttons for cancel and add paper */}
                            <DialogFooter className="mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-red-500 text-white hover:bg-red-300"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving || !title.trim()}
                                    className="bg-blue-300 text-white hover:bg-blue-200"
                                >
                                    {saving ? "Creating..." : "Add Paper"}
                                </Button>
                            </DialogFooter>
                        </form>

                    </DialogContent>
                </Dialog>
            </div>

        </main >

    );

}