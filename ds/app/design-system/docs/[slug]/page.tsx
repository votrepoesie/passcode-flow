import { getDoc, allSlugs } from "../docs";
import { DocView } from "../doc-view";
import { brand } from "@/lib/brand";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  return { title: doc ? `${doc.title} · ${brand.name} Docs` : `Docs · ${brand.name}` };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DocView slug={slug} />;
}
