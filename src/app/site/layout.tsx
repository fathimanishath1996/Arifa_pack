import type { Metadata } from "next";
import { DEFAULT_CONTENT } from "@/data/website-content";

export const metadata: Metadata = {
  title: DEFAULT_CONTENT.settings.pageTitle,
  description: DEFAULT_CONTENT.settings.metaDescription,
};

/** The public website: white page, its own font, none of the CRM around it. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="site-theme min-h-screen bg-white font-site text-neutral-950">{children}</div>;
}
