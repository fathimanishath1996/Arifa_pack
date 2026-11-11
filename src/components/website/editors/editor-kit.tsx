"use client";

import type { ContentKey, SiteContent } from "@/lib/website-types";
import { unpublishedSections, updateDraft, useWebsiteStore } from "@/store/website-store";

/** Reads one part of the draft and saves edits straight back to it (the website changes only on Publish). */
export function useDraftSection<Key extends ContentKey>(key: Key) {
  const value = useWebsiteStore().draft[key];
  const setValue = (next: SiteContent[Key]) => updateDraft(key, next);
  const patch = (changes: Partial<SiteContent[Key]>) => updateDraft(key, { ...value, ...changes });
  return { value, setValue, patch };
}

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

/** Pages share one header layout (title, tabs, meta); see website-ui. */
export { EditorPage } from "@/components/website/website-ui";

/** "Draft" when the section has unpublished edits, otherwise "Published". */
export function useSectionStatus(...keys: ContentKey[]): string {
  const changed = unpublishedSections(useWebsiteStore());
  return keys.some((key) => changed.includes(key)) ? "Draft" : "Published";
}

/** One-line summary under a list page title, e.g. "Published · 8 items · 7 on website". */
export function listSubtitle(status: string, items: { isVisible: boolean }[]) {
  return `${status} · ${items.length} ${items.length === 1 ? "item" : "items"} · ${items.filter((item) => item.isVisible).length} on website`;
}
