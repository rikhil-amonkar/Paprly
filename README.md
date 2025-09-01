# Paprly
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/rikhil-amonkar/Paprly)

Paprly is a research management tool designed to streamline your academic workflow. It allows you to ingest papers from arXiv, generate AI-powered summaries, and organize your research into projects.

The application features a Next.js frontend for a dynamic user experience and a Python FastAPI backend to handle AI-based text summarization.

## Features

-   **arXiv Integration**: Easily add papers to your library by providing an arXiv URL or ID.
-   **AI Summarization**: Get concise, AI-generated summaries of paper abstracts using a `facebook/bart-large-cnn` model.
-   **Paper Library**: Manage and view all your saved papers in a centralized library.
-   **Project Management**: Organize your research by creating projects and associating them with relevant papers.
-   **Modern Tech Stack**: Built with Next.js, TypeScript, Tailwind CSS, Prisma, and FastAPI.

## Tech Stack

-   **Frontend**: Next.js (React), TypeScript, Tailwind CSS, shadcn/ui
-   **Backend (API & Database)**: Next.js API Routes, Prisma, SQLite
-   **Backend (ML Service)**: Python, FastAPI, Hugging Face Transformers

## Getting Started

To run Paprly locally, you will need Node.js, pnpm (or npm/yarn), and Python 3.x installed.

### 1. Clone the Repository

```bash
git clone https://github.com/rikhil-amonkar/paprly.git
cd paprly
```

### 2. Configure the Backend (FastAPI)

The AI summarization service runs on a separate Python server.

```bash
# Navigate to the server directory
cd paprly-server

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Return to the root directory
cd ..
```

### 3. Configure the Frontend (Next.js)

```bash
# Install Node.js dependencies
pnpm install

# Set up the SQLite database and apply migrations
pnpm prisma migrate dev
```

### 4. Run the Application

The project includes a convenience script to start both the backend and frontend servers concurrently.

```bash
pnpm run dev:all
```

This script will:
1.  Start the FastAPI server on `http://127.0.0.1:8000`.
2.  Wait for the FastAPI server to be ready.
3.  Start the Next.js development server on `http://localhost:3000`.

You can now open [http://localhost:3000](http://localhost:3000) in your browser to use Paprly.

## Application Structure

The application is structured as a monorepo with a Next.js frontend and a Python backend.

-   `src/`: Contains the Next.js application.
    -   `app/api/`: API routes for CRUD operations on papers and projects, and a proxy for the summarization service.
    -   `app/(pages)/`: Frontend pages for the landing page, paper library, and project management.
    -   `components/`: Reusable React components, including shadcn/ui elements.
    -   `lib/`: Utility functions, including the Prisma client and arXiv API helpers.
-   `paprly-server/`: The FastAPI server for ML model inference.
    -   `server.py`: Defines the `/summarize` endpoint.
-   `prisma/`: The Prisma schema and database configuration.
    -   `schema.prisma`: Defines the `Paper` and `Project` data models.