"use client";

import { useWebsiteStore } from "@/store/website-store";
import { SiteView } from "@/components/site/SiteView";

/** The public website always shows the published version. */
export function LiveSite() {
  const { published } = useWebsiteStore();
  return <SiteView content={published} />;
}
