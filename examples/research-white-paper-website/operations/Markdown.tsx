import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

function rewriteRelativeLink(href: string, currentParts: string[]): string {
  if (/^[a-z]+:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:")) return href;
  if (href.startsWith("/")) return href;
  const dir = currentParts.slice(0, -1);
  const parts = href.split("/").filter(Boolean);
  const stack = [...dir];
  for (const p of parts) {
    if (p === "..") stack.pop();
    else if (p !== ".") stack.push(p);
  }
  return `/browse/${stack.join("/")}`;
}

export function Markdown({ content, parts }: { content: string; parts: string[] }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const resolved = href ? rewriteRelativeLink(href, parts) : "#";
            const isExternal = /^[a-z]+:\/\//i.test(resolved);
            if (isExternal) return <a href={resolved} target="_blank" rel="noopener noreferrer">{children}</a>;
            return <Link href={resolved}>{children}</Link>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
