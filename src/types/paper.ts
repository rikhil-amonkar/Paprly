// Empty paper schema
export type Paper = {
    id?: string;  // Make optional for search cases
    arxivId?: string;
    url?: string;
    title: string;
    abstract?: string;
    contributors?: string;
    datePublished?: string;

    // arXiv-only
    authors?: string[];
    published?: string;

    problem?: string;
    method?: string;
    results?: string;
    limitations?: string;
};