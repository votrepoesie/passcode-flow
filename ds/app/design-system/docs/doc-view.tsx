import { notFound } from "next/navigation";
import { getDoc, listDocs } from "./docs";
import { DocArticle } from "./[slug]/doc-article";
import { SiteNav } from "@/app/site-nav";
import { DocsNav } from "@/components/ds/docs-nav";

/** The docs reading layout — nav + rail (list + on-this-page TOC) + article.
 *  Shared by the `[slug]` route and the index route so `/design-system/docs`
 *  renders the first doc in place (no redirect flicker). */
export function DocView({ slug }: { slug: string }) {
  const doc = getDoc(slug);
  if (!doc) notFound();

  const docs = listDocs();

  return (
    <div className="ds flex h-screen flex-col overflow-hidden bg-background">
      <SiteNav />
      <div className="flex min-h-0 flex-1">
        {/* Doc rail: list card + on-this-page TOC */}
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 overflow-y-auto p-4 md:block">
          <DocsNav
            docs={docs.map((d) => ({ slug: d.slug, title: d.title }))}
            activeSlug={slug}
            toc={doc.toc}
          />
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[820px] px-12 py-14">
            <p className="mb-8 font-medium text-label text-muted-foreground">
              Last edited{" "}
              {new Date(doc.lastEdited + "T00:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <DocArticle html={doc.html} />
          </div>
        </main>
      </div>
    </div>
  );
}
