"use client";
import { METHODS } from "http";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Empty project schema
type Project = {
    id: string;
    title: string;
    abstract?: string | null;
    theme?: string | null;
    contributors?: string | null;
    createdAt: string;
    updatedAt: string;
};

type Mode = "create" | "edit";

// Default home function to run frontend and routes
export default function Home() {

    // Define state variables (project, title, abstract) -> then states (loading, saving, error)
    const [projects, setProjects] = useState<Project[]>([]);  // Start with empty project list
    const [title, setTitle] = useState("");  // Start with empty title
    const [abstract, setAbstract] = useState("");  // Start with empty abstract
    const [theme, setTheme] = useState("");  // Start with empty theme
    const [contributors, setContributors] = useState("");  // Start with empty contributors
    const [saving, setSaving] = useState(false);  // Nothing is saved right away
    const [open, setOpen] = useState(false);  // Dialog is closed by default
    const [loading, setLoading] = useState(true);  // Screen should start loading
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>("create");
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Fetch all the projects
    async function load() {

        // Set initial states
        setLoading(true);
        setError(null);

        // Fetch the projects
        try {
            const res = await fetch("api/projects", { cache: "no-store" });
            const data = await res.json();  // Convert data into json format

            // Update paper state
            setProjects(data)

        } catch (error) {
            setError("Failed to load projects.");
        } finally {
            setLoading(false)
        }
    }

    // Runs load() when the page first opens (when project list starts empty)
    useEffect(() => { load(); }, []);

    // Function to create and add a new project 
    async function createProject(e: React.FormEvent) {  // Create a form with React

        e.preventDefault();  // Stops page from reloading when form submits

        // Check for empty title
        if (!title.trim()) {
            setSaving(true);
        }

        // Fetch projects and specify what action is being taken
        try {
            const res = await fetch("api/projects", {
                method: "POST",  // Specify method (posting project)
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, abstract, theme, contributors }),  // Sends JSON format string to backend
            });

            // Send created project but check for invalid format
            const created: Project = await res.json();
            if (!res.ok) throw new Error((created as any)?.error || "Created failed");  // Throw an error if creating failed

            // Add project to projects list
            setProjects(prev => [created, ...prev])  // Adds newest project to front of list

            setTitle("");
            setAbstract("");
            setTheme("");
            setContributors("");
            setOpen(false);

        } catch (error: any) {  // Catch any errors
            alert(error.message ?? "Create failed");
        } finally {
            setSaving(false);
        }
    }

    // Function to delete a project
    async function deleteProject(id: string) {

        // Confirm if user wants to delete selected paper
        if (!confirm("Delete this project?")) return;

        const res = await fetch(`api/projects/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            alert(j.error ?? "Delete failed");
            return;
        }

        // Remove the id of the previous paper (the one being deleted) from the UI and list
        setProjects(prev => prev.filter(p => p.id != id));
    }

    return (

        // Main page layout
        <main className="mx-auto max-w-6xl px-6 pt-24 md:pt-28 pb-16">

            {/* Card component for manual project add */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-700">Your Projects</h1>

                {/* Dialog component for adding a new project */}
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

                        {/* Pop-op form for adding a new project */}
                        <form onSubmit={createProject} className="grid gap-4 pt-2">
                            <Input
                                className="placeholder-gray-400 text-gray-700"
                                placeholder="Project title (required)"
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
                            <Textarea
                                className="placeholder-gray-400 text-gray-700"
                                placeholder="Theme (optional)"
                                rows={2}
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            />
                            <Textarea
                                className="placeholder-gray-400 text-gray-700"
                                placeholder="Contributors (optional)"
                                rows={2}
                                value={contributors}
                                onChange={(e) => setContributors(e.target.value)}
                            />

                            {/* Footer buttons for cancel and add project */}
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
                                    className="bg-blue-400 text-white hover:bg-blue-300"
                                >
                                    {saving ? "Creating..." : "Add Project"}
                                </Button>
                            </DialogFooter>
                        </form>

                    </DialogContent>
                </Dialog>
            </div>

            {/* Card component for project list */}
            <Card className="bg-gray-100 shadow-lg rounded-xl">
                <CardContent>
                    <CardTitle className="mt-6 text-gray-700">Library</CardTitle>
                </CardContent>
                <CardContent className="space-y-4">
                    {loading && <div className="text-sm text-muted-foreground text-gray-700">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {!loading && projects.length == 0 && (
                        <div className="text-sm text-muted-foreground text-gray-700">No projects saved.</div>
                    )}
                    <ul className="space-y-3">
                        {projects.map((p) => (
                            <li key={p.id} className="border rounded-lg p-3 hover:bg-accent">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="space-y-1 text-gray-700 font-semibold">{p.title}</div>
                                        {p.title && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 text-gray-700">
                                                {"Abstract: "}{p.abstract}<br />
                                                {"Theme(s): "}{p.theme}<br />
                                                {"Contributor(s): "}{p.contributors}<br />
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground text-gray-500">
                                            Created: {new Date(p.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-xl text-red-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-20"
                                        onClick={() => deleteProject(p.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

        </main >

    );

}