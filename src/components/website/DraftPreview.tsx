"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { can } from "@/config/roles";
import { useCrm } from "@/store/crm-store";
import { publishDraft, unpublishedSections, useWebsiteStore } from "@/store/website-store";
import { showToast } from "@/components/Toaster";
import { SiteView } from "@/components/site/SiteView";

/** The website exactly as it will look after publishing, with a thin bar to publish or go back. */
function DraftPreviewView() {
  const store = useWebsiteStore();
  const hasChanges = unpublishedSections(store).length > 0;

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 bg-black px-4 py-2 font-sans text-sm text-white">
        <span className="font-medium">Preview · {hasChanges ? "draft, not live yet" : "same as the live website"}</span>
        <div className="flex gap-2">
          <Link href="/website" className="press rounded-full px-3 py-1 hover:bg-white/10">
            Back to Website Panel
          </Link>
          <button
            onClick={() => {
              publishDraft();
              showToast("Published. The website is updated.");
            }}
            disabled={!hasChanges}
            className="press inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-black disabled:opacity-40"
          >
            <Rocket className="size-3.5" /> Publish
          </button>
        </div>
      </div>
      {/* The site header sticks below the preview bar. */}
      <div className="[&_header.sticky]:top-9">
        <SiteView content={store.draft} />
      </div>
    </>
  );
}

/** Only the Manager and MD may see unpublished drafts. */
export function DraftPreview() {
  const { data, role } = useCrm();
  if (!data) return null;
  if (!can(role, "EDIT_WEBSITE")) {
    return (
      <p className="p-10 text-center font-sans text-sm text-neutral-500">
        Only the Manager and MD can preview drafts.{" "}
        <Link href="/site" className="font-medium text-black underline">
          Open the website
        </Link>
      </p>
    );
  }
  return <DraftPreviewView />;
}
