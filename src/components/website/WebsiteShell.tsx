"use client";

import { Eye, Lock, Rocket, Undo2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { can } from "@/config/roles";
import { useCrm } from "@/store/crm-store";
import { discardDraft, publishDraft, unpublishedSections, useWebsiteStore } from "@/store/website-store";
import { showToast } from "@/components/Toaster";
import { LoadingState } from "@/components/ui";
import { useSelectionToolbar } from "@/components/website/toolbar-store";
import { CONTENT_NAV, MESSAGES_NAV, OVERVIEW_NAV } from "@/components/website/website-nav";

const NAV_ITEMS = [OVERVIEW_NAV, MESSAGES_NAV, ...CONTENT_NAV];
const GLASS_PILL = "press glass flex h-10 items-center gap-2 rounded-full px-4 text-sm shadow-sm hover:bg-white";

/** Pill row of every Website page, styled like the CRM's pill switch. */
function SectionNav({ activePath }: { activePath: string | null }) {
  const store = useWebsiteStore();
  const changed = new Set(unpublishedSections(store));
  const changedHrefs = new Set(CONTENT_NAV.filter((item) => changed.has(item.key)).map((item) => item.href));
  const unreadCount = store.messages.filter((message) => !message.isRead).length;

  return (
    <nav className="no-scrollbar flex max-w-full overflow-x-auto rounded-full bg-black/5 p-1" aria-label="Website pages">
      {NAV_ITEMS.map((item) => {
        const isActive = activePath === item.href;
        const badge = item.href === MESSAGES_NAV.href && unreadCount > 0 ? unreadCount : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`press flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap ${isActive ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"}`}
          >
            <item.icon className="size-3.5" /> {item.label}
            {badge !== null && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">{badge}</span>}
            {changedHrefs.has(item.href) && <span className="size-1.5 rounded-full bg-black" title="Unpublished changes" />}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveSectionNav() {
  return <SectionNav activePath={usePathname()} />;
}

/** Publish, Preview and Discard; while rows are ticked, a black pill with actions for them instead. */
function PublishControls() {
  const store = useWebsiteStore();
  const selection = useSelectionToolbar();
  const changedCount = unpublishedSections(store).length;
  const hasChanges = changedCount > 0;

  const publish = () => {
    publishDraft();
    showToast("Published. The website is updated.");
  };
  const discard = () => {
    if (!window.confirm("Discard all unpublished changes?")) return;
    discardDraft();
    showToast("Draft discarded");
  };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {selection ? (
        <motion.div key="selection" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex h-10 items-center gap-0.5 rounded-full bg-black p-1 text-white shadow-lg" role="toolbar" aria-label="Selected items">
          <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black">{selection.count} selected</span>
          {selection.actions.map((action) => (
            <button key={action.label} onClick={action.onClick} className="press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white">
              <action.icon className="size-3.5" /> <span className="max-sm:hidden">{action.label}</span>
            </button>
          ))}
          <button onClick={selection.onClear} aria-label="Clear selection" title="Clear selection" className="press grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <X className="size-3.5" />
          </button>
        </motion.div>
      ) : (
        <motion.div key="publish" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
          <span className="mr-1 flex items-center gap-2 text-xs text-neutral-500 max-sm:hidden">
            <span className={`size-2 rounded-full ${hasChanges ? "bg-black" : "bg-neutral-300"}`} />
            {hasChanges ? `${changedCount} unpublished` : "All published"}
          </span>
          {hasChanges && (
            <button onClick={discard} className={GLASS_PILL}>
              <Undo2 className="size-4" /> <span className="max-sm:hidden">Discard</span>
            </button>
          )}
          <Link href="/site/preview" target="_blank" className={`group ${GLASS_PILL} pl-1.5`}>
            <span className="grid size-7 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-12">
              <Eye className="size-3.5" />
            </span>
            Preview
          </Link>
          <button onClick={publish} disabled={!hasChanges} className="press flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white shadow-md hover:bg-neutral-800 disabled:bg-white/60 disabled:text-neutral-400 disabled:shadow-none">
            <Rocket className="size-4" /> Publish
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The Website Panel: only the Manager and MD may edit and publish the public site. */
export function WebsiteShell({ children }: { children: ReactNode }) {
  const { data, role } = useCrm();
  // Before the browser data loads (and while the server prerenders), keep the page rendered but hidden,
  // so Next.js can still check the route for instant navigation.
  if (!data) {
    return (
      <>
        <LoadingState />
        <div hidden>{children}</div>
      </>
    );
  }

  if (!can(role, "EDIT_WEBSITE")) {
    return (
      <div className="animate-enter panel mx-auto mt-10 flex max-w-md flex-col items-center p-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-black text-white">
          <Lock className="size-5" />
        </span>
        <p className="mt-4 font-medium">The Website Panel is for the Manager and MD.</p>
        <Link href="/" className="press mt-5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
          Back to Today
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="animate-enter mb-6 flex flex-col gap-3">
        <Suspense fallback={<SectionNav activePath={null} />}>
          <ActiveSectionNav />
        </Suspense>
        <div className="flex justify-end">
          <PublishControls />
        </div>
      </div>
      {children}
    </div>
  );
}
