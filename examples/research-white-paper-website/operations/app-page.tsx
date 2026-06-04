import Link from "next/link";
import { SECTIONS, readReadme } from "@/lib/content";
import { Markdown } from "@/components/Markdown";

export default async function Home() {
  const readme = await readReadme();
  return (
    <div className="space-y-12">
      <section>
        <Markdown content={readme} parts={["README.md"]} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-5 pb-1.5 border-b border-[var(--color-rule)]">Browse</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.slug} className="border border-[var(--color-rule)] rounded p-5 bg-[var(--color-paper)] hover:border-[var(--color-accent)] transition-colors">
              <Link href={`/browse/${s.slug}`} className="font-semibold text-xl">
                {s.label}
              </Link>
              <p className="text-base text-[var(--color-muted)] mt-2 leading-relaxed">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
