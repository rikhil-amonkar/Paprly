from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from transformers import pipeline
import arxiv
import requests
import feedparser
from fastapi import HTTPException
import re

# Define the FastAPI app
app = FastAPI(title="Paprly Server", version="0.1.0")

# CORS origin settings (for development purposes)
origins = [
    "http://localhost:3000"  # React development server
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow defined origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# ***** App Health *****
@app.get("/health")
def health():
    return {"status": "ok"}

# ***** Summarization Endpoint *****

# Define a Pydantic model for the request body
class Summarize(BaseModel):
    text: str
    max_length: Optional[int] = 150  # Default max length for summary

# Define model for summarization (using transformers library)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Define a simple root endpoint
@app.post("/summarize")
def model_summary(payload: Summarize):

    text = payload.text.strip()

    # Create the prompt for summarization
    prompt = (
        f"Summarize the following text in ~{payload.max_length} tokens or fewer. "
        f"Focus on key points and details:\n\n{payload.text}"
    )

    # Generate the summary using the model
    res = summarizer(
            text,
            max_length=payload.max_length,
            min_length=25,
            do_sample=False
        )

    # Extract the summary text from the result
    summary = res[0]['summary_text']
    return {"summary": summary}  # Return the summary as JSON

# ***** ArXiv Search Endpoint *****

# Define a Pydantic model for the search request
class ArxivSearch(BaseModel):
    query: str
    max_results: Optional[int] = 5  # Default max results
    sort_by: Optional[str] = "SubmittedDate"  # Default sort by
    sort_order: Optional[str] = "Descending"  # Default sort order

# Define the arXiv search endpoint
@app.post("/arxiv_search")
def arxiv_search(payload: ArxivSearch):

    try:
        # Perform the search using the arxiv library
        search = arxiv.Search(
            query=payload.query,
            max_results=payload.max_results,
            sort_by=getattr(arxiv.SortCriterion, payload.sort_by, arxiv.SortCriterion.SubmittedDate),
            sort_order=getattr(arxiv.SortOrder, payload.sort_order, arxiv.SortOrder.Descending)
        )

        # Collect results
        results = []
        for result in search.results():

            # All details for paper retrieval
            results.append({
                "id": result.entry_id.split("/")[-1], # arXiv ID (removed from link)
                "title": result.title,
                "abstract": result.summary,
                "contributors": ", ".join(author.name for author in result.authors),
                "datePublished": str(result.published.isoformat()) if result.published else None,  # Convert datetime to ISO format
                "url": result.entry_id  # Full paper link
            })

        return {"results": results}  # Return the search results as JSON
    except Exception as e:
        return {"error": str(e)}

# Define a id based arxiv search endpoint
@app.get("/arxiv_paper/{arxiv_id}")
def arxiv_paper(arxiv_id: str):
    try:
        # Strip version suffix
        base_id = re.sub(r"v\d+$", "", arxiv_id)

        # Fetch the paper from the API directly
        url = f"http://export.arxiv.org/api/query?id_list={base_id}"
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail="arXiv API error")

        # Check if paper not found
        feed = feedparser.parse(r.text)
        if not feed.entries:
            raise HTTPException(status_code=404, detail=f"Paper {arxiv_id} not found")

        entry = feed.entries[0]

        # Return details
        return {
            "id": entry.id.split("/")[-1],
            "title": entry.title,
            "abstract": entry.summary,
            "contributors": ", ".join(a.name for a in entry.authors),
            "datePublished": entry.published if hasattr(entry, "published") else None,
            "url": entry.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
