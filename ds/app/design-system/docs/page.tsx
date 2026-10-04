import { notFound } from "next/navigation";
import { listDocs } from "./docs";
import { DocView } from "./doc-view";
import { brand } from "@/lib/brand";

export const metadata = { title: `Docs · ${brand.name} Design System` };

// The docs index is an entry point, not a separate list page: render the first
// doc in the rail in place, so landing on /design-system/docs shows content
// immediately (no redirect, no flicker).
export default function DocsIndex() {
  const first = listDocs()[0];
  if (!first) notFound();
  return <DocView slug={first.slug} />;
}
