// Classify arXiv id and url
export async function classifyArxiv(input: string) {
    const s = input.trim();

    console.log("Classifying arXiv input:", s);

    // direct id like 2410.12345 or 2410.12345v2
    if (/^\d{4}\.\d{5}(v\d+)?$/i.test(s)) {
        return { kind: "id", id: s };
    }

    // direct id like arXiv:2410.12345 or arXiv:2410.12345v2
    if (/^arXiv:\d{4}\.\d{5}(v\d+)?$/i.test(s)) {
        const id = s.replace(/^arXiv:/i, "");  // remove arXiv: prefix
        return { kind: "id", id: id };
    }

    // direct id like doi.org/10.48550/arXiv.2505.13252
    try {
        const u = new URL(s);
        if (u.hostname.includes("doi.org")) {
            const path = u.pathname.replace(/^\/+/g, "");  // remove leading /
            if (/^10\.48550\/arXiv\.\d{4}\.\d{5}(v\d+)?$/i.test(path)) {
                const id = path.replace(/^10\.48550\/arXiv\./i, "");  // remove 10.48550/arXiv. prefix
                return { kind: "id", id: id };
            }
        }
        if (/^doi\.org\/10\.48550\/arXiv\.\d{4}\.\d{5}(v\d+)?$/i.test(s)) {
            const id = s.replace(/^doi\.org\/10\.48550\/arXiv\./i, "");  // remove doi.org/10.48550/arXiv. prefix
            return { kind: "id", id: id };
        }
    } catch (e) {
        // throw error if not a url
    }

    // Try for arxiv url
    try {
        const u = new URL(s);
        if (u.hostname.includes("arxiv.org")) {  // check if link has arxiv.org
            const parts = u.pathname.split("/");  // split path by /
            const last = parts[parts.length - 1];  // get last part
            const id = last.replace(/\.pdf$/i, "");  // remove .pdf if present
            return { kind: "id", id };
        }

    } catch (e) {
        // throw error if not a url
    }
    return { kind: "unknown" as const };  // unknown input
}

// Fetch arXiv metadata by id
import { XMLParser } from "fast-xml-parser";

// Shape of normalized arXiv metadata
type ArxivNormalized = {
    arxivId: string;
    title: string;
    abstract?: string;
    authors: string[];
    url: string;
    pdfUrl?: string;
    year?: number;
}

export async function fetchArxiv(id: string): Promise<ArxivNormalized | null> {
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
    const res = await fetch(apiUrl, { method: "GET" });
    if (!res.ok) {
        console.error(`Failed to fetch arXiv metadata for id ${id}: ${res.statusText}`);
        return null;
    }

    // Parse XML response
    const xml = await res.text();
    const parser = new XMLParser({  // configure parser
        ignoreAttributes: false,  // don't ignore attributes
        attributeNamePrefix: "",  // no prefix for attributes
        trimValues: true,  // trim whitespace
    });
    const feed = parser.parse(xml);  // parse xml

    // Extract entry
    const entry = Array.isArray(feed.feed.entry) ? feed.feed.entry[0] : feed.feed.entry;  // get first entry if multiple
    if (!entry) {
        console.error(`No entry found in arXiv response for id ${id}`);
        return null;
    }

    // Normalize metadata
    const title = entry.title?.replace(/\s+/g, " ").trim() || "";  // clean title
    const abstract = entry.summary?.replace(/\s+/g, " ").trim() || "";  // clean abstract
    const authorField = entry.author  // Can be single object or array
    const authors: string[] = Array.isArray(authorField)  // normalize authors to array
        ? authorField.map((a: any) => a.name).filter(Boolean)  // extract names
        : authorField?.name  // single author case
            ? [authorField.name]  // wrap single name in array
            : [];

    // Handle links
    let absUrl = `https://arxiv.org/abs/${id}`;  // abstract url
    let pdfUrl: string | undefined = undefined;  // initialize pdf url
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];  // normalize links to array
    for (const link of links) {
        if (link?.title == "pdf" && link?.href) pdfUrl = link.href;  // find pdf link
        if (link?.rel == "alternate" && link?.href) absUrl = link.href;  // find alternate link)
    }

    // Extract year from published date
    let year: number | undefined = undefined;
    if (entry.published) {
        const y = new Date(entry.published).getUTCFullYear();  // extract year
        if (!isNaN(y)) year = y;  // set year if valid
    }

    // Return normalized metadata
    return {
        arxivId: id,
        title: title || `arXiv:${id}`,  // fallback title
        abstract,
        authors,
        url: absUrl,
        pdfUrl,
        year,
    }
}

