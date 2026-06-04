// Vercel serverless function: proxies a single embedding request to Gemini
// so the API key never reaches the browser bundle.
//
// Mirrors the Vite dev middleware in vite.config.js so the client can call
// /api/embed in both local dev and production with no code changes.
//
// Requires GEMINI_API_KEY to be set in the Vercel project's Environment
// Variables (Settings → Environment Variables).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" })
    return
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.status(500).json({ error: "GEMINI_API_KEY not set on server" })
    return
  }

  let text
  try {
    // Vercel parses JSON bodies automatically when content-type is application/json
    text = (req.body && req.body.text) || null
  } catch {
    res.status(400).json({ error: "invalid JSON body" })
    return
  }
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "missing text" })
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: "SEMANTIC_SIMILARITY",
        outputDimensionality: 256,
      }),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) })
  }
}
