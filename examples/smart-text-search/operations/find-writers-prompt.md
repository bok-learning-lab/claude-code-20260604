Carefully READ (do not grep or use regex) these Bob Dylan lyrics to find every
writer named in them.

Load the JSON file at <path/to/bob_dylan_lyrics_unique.json>. It's a list of
objects, each with the keys: name, first_album, first_album_year, text.
Process ONLY the songs at list indices {START} through {END} inclusive.

Read each song's full lyric like a close reader. Identify every writer named
anywhere in it — poets, novelists, playwrights, songwriters, lyricists,
essayists, philosophers who wrote books, journalists, and so on.

Rules:
- When a single line names TWO OR MORE people (e.g. "Nietzsche and Wilhelm Reich"
  or "Verlaine's and Rimbaud's"), list EACH writer separately — never drop the
  second name.
- Catch obscure or lesser-known writers too, not just the famous ones.
- Exclude anyone who isn't a writer: actors, athletes, politicians (unless cited
  as authors), saints, fictional or generic characters, place names, and common
  words that merely coincide with a surname (e.g. "frost," "pound," "swift").
- Do NOT invent matches. Only include names that actually appear in the text.

Write your findings as JSON to <outputs/batch_NN.json> in this shape:

[
  {
    "song": "<song name>",
    "index": <int>,
    "writers": [
      { "name": "<full writer name>", "quote": "<the exact line it appears in>" }
    ]
  }
]

Include only songs that name at least one writer; write an empty list [] if none.
Then reply with a one-line summary listing the writers you found.