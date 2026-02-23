# How to Publish a Blog Post

Follow these steps in order. Every step is required unless marked optional.

---

## 0. Pre-flight

- Choose a slug: `YYYY-MM-DD-short-title` (use today's date)
- Confirm authors (name + title for humans; name + org for AI co-authors)
- Note any new concepts the article introduces — needed for step 6

---

## 1. Create the post file

**File:** `posts/YYYY-MM-DD-slug.html`

Copy the structure from the most recent post. Required elements:

### `<head>`
| Element | Notes |
|---|---|
| `<title>` | Article title + ` - inblock.io` |
| Stylesheet + favicons | Copy verbatim from existing post |
| `<link rel="ai-discovery">` | Always include: `href="/.well-known/ai"` |
| `<meta name="description">` | 1–2 sentence summary, ~155 chars |
| OpenGraph tags | `og:title`, `og:description`, `og:type` = `article`, `og:url` (full URL), `og:image`, `og:site_name`, `article:published_time` (YYYY-MM-DD), `article:author` |
| Twitter Card | `twitter:card` = `summary`, `twitter:title`, `twitter:description` |
| JSON-LD | `@type: BlogPosting`, `headline`, `description`, `datePublished`, `author` (array if multiple), `url`, `publisher` |

### `<body>`
```
header > div.header-content > a[logo] + h1[title]
section#article > div.section-inner >
    p.post-date          ← "Month DD, YYYY"
    h2                   ← article title
    p > em               ← byline: "By Name, Title[, and Co-author, Org]"
    ... article content ...
    hr
    h3 Resources
    ul > li links
    p > a[← Back to Updates]
footer (copy verbatim) + aqua-animation script
```

**HTML entities to use:** `&rsquo;` `&ldquo;` `&rdquo;` `&mdash;` `&ndash;` `&hellip;`

---

## 2. Update `posts/index.html`

Add a new `div.post-item` at the **top** of `div.posts-list`:

```html
<div class="post-item">
    <h3><a href="./YYYY-MM-DD-slug.html">Article Title</a></h3>
    <p class="post-date">Mon DD, YYYY</p>
    <p>One-sentence summary.</p>
</div>
```

---

## 3. Update `index.html`

Add the same `div.post-item` block at the **top** of the Latest Updates `div.posts-list` (same format as step 2, but href uses `./posts/` prefix).

---

## 4. Update `ai/feed.json`

Add a new entry at the **top** of the `feed.entries` array:

```json
{
  "id": "YYYY-MM-DD-slug",
  "title": "Article Title",
  "date": "YYYY-MM-DD",
  "url": "https://inblock.io/posts/YYYY-MM-DD-slug.html",
  "summary": "2–4 sentence narrative summary covering the core argument.",
  "keyFacts": [
    "Distilled claim 1.",
    "Distilled claim 2.",
    "Distilled claim 3 — aim for 4–6 facts."
  ],
  "tags": ["relevant", "semantic", "tags"]
}
```

Write `keyFacts` as standalone, self-contained statements an AI can use without reading the full article.

---

## 5. Update `sitemap.xml`

1. Add a new `<url>` block after the `/posts/` entry:
```xml
<url>
  <loc>https://inblock.io/posts/YYYY-MM-DD-slug.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <priority>0.7</priority>
</url>
```
2. Update `<lastmod>` on the root `/` and `/posts/` entries to today's date.

---

## 6. Update `ai/knowledge.json` (if article introduces new concepts)

If the article defines new terms or frameworks, add them to the `glossary` array:

```json
{
  "term": "Term Name",
  "definition": "Precise, standalone definition an AI can use without further context."
}
```

Skip this step if the article doesn't introduce new vocabulary.

---

## Checklist

```
[ ] posts/YYYY-MM-DD-slug.html   created
[ ] posts/index.html             new post-item at top
[ ] index.html                   new post-item at top
[ ] ai/feed.json                 new entry at top of entries[]
[ ] sitemap.xml                  new <url> added, lastmod updated on / and /posts/
[ ] ai/knowledge.json            new glossary terms (if applicable)
```

---

## Notes

- **Aqua Protocol links:** `https://aqua-protocol.org` is the main protocol site. `https://aqua-protocol.org/v4` is a separate landing page for the AI-agent pivot (sales entry point) — use it when the context is about AI agent trust infrastructure specifically. Either is valid; they are not in a hierarchy.
- **AI co-authors:** Credit in byline as `Name, Org` and include as a second `author` object in JSON-LD.
- **`/.well-known/ai`** and **`llms.txt`** do not need per-post updates — they link to the feed and knowledge files which AI agents follow.
- **`robots.txt`** never needs updating for new posts.
