import arxiv

# Example: search for papers with "machine learning" in the title
search = arxiv.Search(
    query="Rikhil",
    max_results=1,
    sort_by=arxiv.SortCriterion.SubmittedDate
)

# Print the results
for result in search.results():
    print("Title:", result.title)
    print("Authors:", [author.name for author in result.authors])
    print("Published:", result.published)
    print("Abstract:", result.summary)
    print("URL", result.entry_id)
    print("---------------------------")
