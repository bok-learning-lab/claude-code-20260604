import Link from "next/link";
import { notFound } from "next/navigation";
import { listDir, readText, readBinary, statPath, humanSize, extKind, SECTIONS } from "@/lib/content";
import { Markdown } from "@/components/Markdown";

type Params = { path: string[] };

function Breadcrumbs({ parts }: { parts: string[] }) {
  return (
    <nav className="text-base text-[var(--color-muted)] mb-5">
      <Link href="/">Home</Link>
      {parts.map((p, i) => {
        const sub = parts.slice(0, i + 1);
        return (
          <span key={i}>
            <span className="mx-2">/</span>
            <Link href={`/browse/${sub.join("/")}`}>{p}</Link>
          </span>
        );
      })}
    </nav>
  );
}

export default async function BrowsePage({ params }: { params: Promise<Params> }) {
  const { path: parts } = await params;
  if (!parts || parts.length === 0) notFound();

  let info;
  try {
    info = await statPath(parts);
  } catch {
    notFound();
  }

  if (info.isDirectory()) {
    const entries = await listDir(parts);
    const section = SECTIONS.find((s) => s.slug === parts[0]);
    return (
      <div>
        <Breadcrumbs parts={parts} />
        <h1 className="text-3xl font-bold mb-2">{section && parts.length === 1 ? section.label : parts[parts.length - 1]}</h1>
        {section && parts.length === 1 && <p className="text-lg text-[var(--color-muted)] mb-7 leading-relaxed">{section.blurb}</p>}
        {entries.length === 0 ? (
          <p className="text-[var(--color-muted)] italic">Empty directory.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-rule)] border border-[var(--color-rule)] rounded bg-[var(--color-paper)] text-lg">
            {entries.map((e) => (
              <li key={e.name} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#fbf6ec]">
                <Link href={`/browse/${e.parts.join("/")}`} className="flex-1 truncate">
                  <span className="mr-2.5 text-[var(--color-muted)]">{e.isDirectory ? "▸" : iconFor(e.ext)}</span>
                  {e.name}
                </Link>
                <span className="text-sm text-[var(--color-muted)] tabular-nums">{e.isDirectory ? "" : humanSize(e.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const ext = parts[parts.length - 1].toLowerCase().slice(parts[parts.length - 1].lastIndexOf("."));
  const kind = extKind(ext);

  return (
    <div>
      <Breadcrumbs parts={parts} />
      <div className="flex items-baseline justify-between gap-4 mb-7 flex-wrap">
        <h1 className="text-3xl font-bold break-all">{parts[parts.length - 1]}</h1>
        <a href={`/api/file/${parts.join("/")}`} className="text-base whitespace-nowrap" download>
          Download raw
        </a>
      </div>
      {kind === "markdown" ? (
        <Markdown content={await readText(parts)} parts={parts} />
      ) : kind === "text" || kind === "code" || kind === "data" ? (
        <pre className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded p-5 overflow-x-auto text-base whitespace-pre-wrap break-words font-mono leading-relaxed">
          {await readText(parts)}
        </pre>
      ) : kind === "pdf" ? (
        <div>
          <iframe
            src={`/api/file/${parts.join("/")}`}
            className="w-full h-[85vh] border border-[var(--color-rule)] rounded bg-[var(--color-paper)]"
            title={parts[parts.length - 1]}
          />
        </div>
      ) : (
        <p className="text-[var(--color-muted)] text-lg">
          No inline preview for this file type.{" "}
          <a href={`/api/file/${parts.join("/")}`} download>
            Download
          </a>
          .
        </p>
      )}
    </div>
  );
}

function iconFor(ext: string): string {
  if (ext === ".md") return "📝";
  if (ext === ".pdf") return "📕";
  if (ext === ".txt" || ext === ".wiki") return "📄";
  if (ext === ".py" || ext === ".ts" || ext === ".tsx" || ext === ".js") return "⚙";
  if (ext === ".json") return "{}";
  return "·";
}

export const dynamic = "force-dynamic";

void readBinary;
