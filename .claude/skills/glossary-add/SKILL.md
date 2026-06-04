---
name: glossary-add
description: Adds a new term to the workshop AI glossary, writing both the Markdown and HTML variants in the existing format and updating the index. Trigger when the user asks to "add a glossary entry", "add a term", "add X to the glossary", or runs /glossary-add <term>.
disable-model-invocation: true
---

The workshop AI glossary lives at [resources/glossary/](../../../resources/glossary/) and is maintained as **two parallel collections** of the same entries. Both must be updated together.

- Markdown: `resources/glossary/glossary-md/<slug>.md`
- HTML: `resources/glossary/glossary-html/<slug>.html`
- Indexes: `glossary-md/00-index.md` and `glossary-html/index.html`

## Step 1 — Determine the term and slug

The argument after `/glossary-add` is the term (e.g. `/glossary-add prompt caching`). If no argument was given, ask the user for the term.

The slug is the lowercase hyphenated form: `prompt-caching`, `claude-md`, `api`. Confirm the slug with the user before writing if there's any ambiguity (e.g. acronyms).

## Step 2 — Read an existing entry as a template

Before writing anything, read **both** files for an existing term that's structurally similar — e.g. `api.md` and `api.html`. Match their:

- Frontmatter / head structure (the HTML has a full `<!DOCTYPE>` shell linking `style.css`)
- Section headings: `# Term`, blockquote starting `> **In one line:**`, `## In plain terms`, `## Why it matters in this workshop`, `## See also`
- Tone: plain-spoken, written for a faculty member who's never used these tools. Loose analogies are welcome. No jargon without unpacking it.
- HTML variant uses `<strong>`, `<em>`, `<blockquote>`, `<ul><li>...</li></ul>`, and `<a href="other-term.html">`.

## Step 3 — Draft the entry in Markdown first

Write the Markdown version. The structure is:

```
# <Term>

> **In one line:** <one-sentence plain-English definition>

## In plain terms

<2–4 short paragraphs. Use analogies. Define any jargon you introduce.>

## Why it matters in this workshop

<1–2 sentences on why a faculty attendee needs this term.>

## See also

- [Other Term](other-term.md) — short reason for the link
- [Another](another.md) — short reason for the link
```

Show the draft to the user and ask for approval before writing files.

## Step 4 — Write both files

Once approved:

1. Write the `.md` file to `glossary-md/<slug>.md` verbatim.
2. Translate to the HTML variant and write to `glossary-html/<slug>.html`. Use the existing `api.html` as the structural template — same `<head>`, same `<nav class="topnav">`, same `<main class="entry">` wrapper. Convert `[link](other.md)` to `<a href="other.html">link</a>`.

## Step 5 — Update the indexes

- Add the new term to `glossary-md/00-index.md` in alphabetical position, matching the existing line format.
- Add it to `glossary-html/index.html` in the same alphabetical position, matching the existing `<li><a>` format.

## Step 6 — Verify cross-links

If the new entry's "See also" section links to other terms, confirm those slugs exist (`ls glossary-md/`). If you linked to a term that doesn't exist yet, flag it to the user — don't silently leave a broken link.

## What to avoid

- Don't invent new section headings. Stick to the existing four.
- Don't use emojis.
- Don't write only one variant — both `.md` and `.html` must land together.
- Don't skip the index updates.
