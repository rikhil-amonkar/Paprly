// Empty paper schema
export type Paper = {
    id: string;
    title: string;
    abstract?: string | null;
    problem?: string | null;
    method?: string | null;
    result?: string | null;
    limitations?: string | null;
    contributors?: string | null;
    url?: string | null;
    createdAt: string;
    datePublished?: string | null;
};