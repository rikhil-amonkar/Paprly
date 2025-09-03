// Empty paper schema
export type Project = {
    id: string;
    title: string;
    goal?: string | null;
    contributors?: string | null;
    papers?: [] | null;  // List of pinned papers
    ideas?: string;
    notes?: string;
    related?: string;
    queue?: string;
    createdAt: string;
    updatedAt: string;
};