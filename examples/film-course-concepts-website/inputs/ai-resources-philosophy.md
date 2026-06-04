# AI Resources for Media Production

This collection of guides will help you use AI tools and command-line utilities to enhance your video essay workflow. These are **technical tools** that help you manipulate, analyze, and present media—but the critical interpretation and argument remain yours.

## Philosophy

**AI as Lab Partner, Not Ghostwriter**

- Use AI to accelerate mechanical tasks: downloading clips, batch-processing files, debugging code
- Keep creative control: your film analysis, interpretive lens, and argumentative voice are irreplaceable
- Think of LLMs as patient technical assistants who help with scaffolding while you build the essay

## What's Inside

### [1. Getting Started: Installation](./01-installation.md)
Install the command-line tools (`ffmpeg` and `yt-dlp`) you'll need for video essay production.

- macOS installation with Homebrew
- Windows installation with Chocolatey
- Verification and troubleshooting

### [2. Working with yt-dlp](./02-yt-dlp.md)
Download video clips from YouTube and other platforms for analysis.

- Basic download commands
- Choosing video formats for your editing software
- Using AI to troubleshoot errors

### [3. Working with ffmpeg](./03-ffmpeg.md)
Transform, analyze, and manipulate video files with this powerful command-line tool.

- Extract stills for composition analysis
- Create gifs from key moments
- Pull audio segments for close listening
- Compress and transcode for different uses
- Generate contact sheets and visualizations
- Detect cuts and scene changes automatically

### [4. Using AI for Technical Help](./04-using-ai.md)
Best practices for working with ChatGPT, Claude, Gemini, and other LLMs.

- Effective prompts for command-line tasks
- Troubleshooting workflows
- When to use AI vs. when to learn the tool directly
- Keeping a changelog of AI-assisted work

### [5. Building Interactive Video Essays](./05-interactive-essays.md)
Learn to create web-based, scroll-synced video presentations that represent the "video essay of the future."

- Introduction to the Next.js framework
- Working with the ScrollVideo component
- Structuring your analysis as data
- Styling with Tailwind CSS
- Prompt patterns for scaffolding code
- Maintaining your creative voice while using AI assistance

## Core Principle: Technical, Not Conceptual

**Use these tools for:**
- ✅ "How do I extract frames from this clip?"
- ✅ "Write an ffmpeg command to compress this video"
- ✅ "Debug this TypeScript error in my Next.js component"
- ✅ "Generate HTML to embed this video with custom controls"

**Don't use these tools for:**
- ❌ "What is this scene about?"
- ❌ "Write my film analysis"
- ❌ "Interpret the symbolism in this sequence"
- ❌ "Generate my video essay argument"

## Example: A Complete Workflow

1. **Download a clip** with `yt-dlp` (see [02-yt-dlp.md](./02-yt-dlp.md))
2. **Extract stills** with `ffmpeg` to study composition (see [03-ffmpeg.md](./03-ffmpeg.md))
3. **Create a gif** of a key moment for close analysis
4. **Write your analysis** (your interpretive work—no AI!)
5. **Build an interactive page** to present your essay on the web (see [05-interactive-essays.md](./05-interactive-essays.md))
6. **Use AI to troubleshoot** technical issues as they arise (see [04-using-ai.md](./04-using-ai.md))

## Getting Help

- Paste error messages into your LLM and ask for solutions
- Use the workshop documentation as a reference
- Bring technical questions to section or office hours
- Remember: the teaching team wants to see your original analysis, supported by technical craft

---

**Ready to start?** → Begin with [01-installation.md](./01-installation.md)
