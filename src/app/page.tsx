"use client";
import { METHODS } from "http";
import { useEffect, useState } from "react";

// Already made components (imports for frontend)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Empty paper schema
type Paper = {
  id: number;
  title: string;
  abstract?: string | null;
  problem?: string | null;
  method?: string | null;
  result?: string | null;
  limitations?: string | null;
  createdAt: string;
};

// **** Routing Componenets ****

// Default home function to run frontend and routes
export default function Home() {

  // Define state variables (paper, title, abstract) -> then states (loading, saving, error)
  const [papers, setPapers] = useState<Paper[]>([]);  // Start with empty paper list
  const [title, setTitle] = useState("");  // Start with empty title
  const [abstract, setAbstract] = useState("");  // Start with empty abstract
  const [loading, setLoading] = useState(true);  // Screen should start loading
  const [saving, setSaving] = useState(false);  // Nothing is saved right away
  const [error, setError] = useState<string | null>(null);

  // Fetch all the papers
  async function load() {

    // Set initial states
    setLoading(true);
    setError(null);

    // Fetch the papers
    try {
      const res = await fetch("api/papers", { cache: "no-store" });
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

    } catch (error: any) {  // Catch any errors
      alert(error.message ?? "Create failed");
    } finally {
      setSaving(false);
    }
  }

  // Function to delete a paper
  async function deletePaper(id: Number) {

    // Confirm if user wants to delete selected paper
    if (!confirm("Delete this paper?")) return;

    const res = await fetch(`api/papers/${id}`, {
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

  // **** Front End Componenets ****

  // Return frontend HTML
  return (
    <main className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-5xl font-semibold text-black">Paprly</h1>
        <p className="text-xl text-muted-foreground text-black">Your papers, all in one place.</p>
      </header>

      <Card className="bg-gray-100 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-black">Add Paper</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPaper} className="grid gap-4">
            <Input
              className="placeholder-gray-400 text-black"
              placeholder="Paper title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              className="placeholder-gray-400 text-black"
              placeholder="Abstract (required)"
              rows={4}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={saving || !title.trim()}
                className="w-40 bg-blue-700 text-white font-semibold hover:bg-blue-300 transition-colors"
              >
                {saving ? "Creating..." : "Add Paper"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-100 shadow-lg rounded-xl">
        <CardContent>
          <CardTitle className="mt-6 text-black">Your Papers</CardTitle>
        </CardContent>
        <CardContent className="space-y-4">
          {loading && <div className="text-sm text-muted-foreground text-black">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && papers.length == 0 && (
            <div className="text-sm text-muted-foreground text-black">No papers yet.</div>
          )}
          <ul className="space-y-3">
            {papers.map((p) => (
              <li key={p.id} className="border rounded-lg p-3 hover:bg-accent">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <a href={`/paper/${p.id}`} className="font-medium hover:underline text-black font-semibold">
                      {p.title}
                    </a>
                    {p.abstract && (
                      <p className="text-sm text-muted-foreground line-clamp-2 text-black">
                        {"Abstract: "}{p.abstract}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-md text-red-500 font-semibold hover:text-red-300 transition-colors"
                    onClick={() => deletePaper(p.id)}
                  >DELETE</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );

}



