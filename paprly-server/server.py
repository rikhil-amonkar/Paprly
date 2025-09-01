from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from transformers import pipeline

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