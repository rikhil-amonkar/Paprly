"use client";
import { METHODS } from "http";
import { useDebugValue, useEffect, useState, useMemo } from "react";

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

type Mode = "create" | "edit";  // Define modes for creating and editing projects

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
    const [error, setError] = useState<string | null>(null);  // No error at start
    const [mode, setMode] = useState<Mode>("create");  // Start in create mode
    const [editingProject, setEditingProject] = useState<Project | null>(null);  // No project is being edited at start

    // Reset form fields and open dialog for creating a new project
    function resetForm() {
        setTitle("");
        setAbstract("");
        setTheme("");
        setContributors("");
        setEditingProject(null);
        setMode("create");
        setSaving(false);
    }

    // Open create dialogue and reset form fields
    function openCreateDialog() {
        resetForm();
        setOpen(true);
    }

    // Open edit dialogue and populate fields with existing project data
    function openEditDialogue(p: Project) {
        setMode("edit");
        setEditingProject(p);
        setTitle(p.title);
        setAbstract(p.abstract ?? "");
        setTheme(p.theme ?? "");
        setContributors(p.contributors ?? "");
        setOpen(true);
    }

    // Fetch all the projects
    async function load() {

        // Set initial states
        setLoading(true);
        setError(null);

        // Fetch the projects
        try {
            const res = await fetch("/api/projects", { cache: "no-store" });
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

    // Trim whitespace from input fields
    const trimmedTitle = title.trim();
    const trimmedAbstract = abstract.trim();
    const trimmedTheme = theme.trim();
    const trimmedContributors = contributors.trim();

    // Check if form content is different from the original project data
    const isFormChanged = useMemo(() => {
        if (mode != "edit" || !editingProject) return true;  // If not in edit mode or no project is being edited, consider form changed
        const o = editingProject;
        const norm = (v?: string | null) => (v ?? "").trim();  // Normalize values by trimming whitespace and handling null/undefined

        // Check if any field has changed
        return (
            norm(o.title) !== trimmedTitle ||
            norm(o.abstract) !== trimmedAbstract ||
            norm(o.theme) !== trimmedTheme ||
            norm(o.contributors) !== trimmedContributors
        );
    }, [mode, editingProject, trimmedTitle, trimmedAbstract, trimmedTheme, trimmedContributors]);

    // Function to create or edit a project based on the current mode
    async function handleSubmit(e: React.FormEvent) {  // Create a form with React
        e.preventDefault();  // Stops page from reloading when form submits

        if (!trimmedTitle) {
            alert("Title is required.");
            return;
        }

        if (mode == "edit" && !isFormChanged) {
            setOpen(false);
            resetForm();
            return;
        }

        setSaving(true);

        try {
            if (mode == "create") {
                const res = await fetch("/api/projects", {
                    method: "POST",  // Specify method (posting project)
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: trimmedTitle, abstract: trimmedAbstract, theme: trimmedTheme, contributors: trimmedContributors }),  // Sends JSON format string to backend
                });

                // Send created project but check for invalid format
                const created: Project = await res.json();
                if (!res.ok) throw new Error((created as any)?.error || "Create failed");
                setProjects(prev => [created, ...prev]);
            } else if (mode === "edit" && editingProject) {
                const res = await fetch(`/api/projects/${editingProject.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: trimmedTitle,
                        abstract: trimmedAbstract || null,
                        theme: trimmedTheme || null,
                        contributors: trimmedContributors || null,
                    }),
                });
                const updated: Project = await res.json();
                if (!res.ok) throw new Error((updated as any)?.error || "Update failed");
                setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            }

            setOpen(false);
            resetForm();
        } catch (error: any) {
            alert(error.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    }

    // Function to delete a project
    async function deleteProject(id: string) {

        // Confirm if user wants to delete selected paper
        if (!confirm("Delete this project?")) return;

        const res = await fetch(`/api/projects/${id}`, {
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
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-gray-700 text-white font-semibold hover:bg-gray-500 my-4"
                            onClick={openCreateDialog}
                        >
                            + Add Project
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-gray-700">
                                {mode === "create" ? "New Project" : "Edit Project"}
                            </DialogTitle>
                        </DialogHeader>

                        {/* Pop-op form for adding a new project */}
                        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
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
                                    disabled={
                                        saving ||
                                        !trimmedTitle ||
                                        (mode === "edit" && !isFormChanged)
                                    }
                                    className="bg-blue-400 text-white hover:bg-blue-300"
                                >
                                    {saving ? mode == "create" ? "Creating..." : "Saving..." : mode == "create" ? "Add Project" : "Save Changes"}
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
                                    <div className="justify-end flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            className="text-md text-red-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                                            onClick={() => deleteProject(p.id)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-md text-blue-500 font-semibold hover:bg-gray-200 transition-colors flex text-center h-10"
                                            onClick={() => openEditDialogue(p)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

        </main >

    );

}