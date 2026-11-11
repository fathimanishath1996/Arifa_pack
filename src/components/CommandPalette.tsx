"use client";

import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { stageLabel } from "@/config/stages";
import { formatCount } from "@/lib/format";
import { useCrm } from "@/store/crm-store";

const LEAD_RESULT_LIMIT = 8;

const PAGES = [
  { title: "Today", subtitle: "Page", href: "/" },
  { title: "Pipeline", subtitle: "Page", href: "/pipeline" },
];

interface SearchResult {
  key: string;
  title: string;
  subtitle: string;
  href: string;
}

let isPaletteOpen = false;
const listeners = new Set<() => void>();

function setPaletteOpen(open: boolean) {
  isPaletteOpen = open;
  listeners.forEach((notify) => notify());
}

export const openCommandPalette = () => setPaletteOpen(true);

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

function PaletteDialog() {
  const { data } = useCrm();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const needle = query.trim().toLowerCase();
  const pageResults: SearchResult[] = PAGES.filter((page) => page.title.toLowerCase().includes(needle)).map((page) => ({ key: page.href, ...page }));
  const leadResults: SearchResult[] = (data?.leads ?? [])
    .filter((lead) => `${lead.company} ${lead.contactName} ${lead.product} ${lead.location} ${lead.id}`.toLowerCase().includes(needle))
    .slice(0, LEAD_RESULT_LIMIT)
    .map((lead) => ({
      key: lead.id,
      title: lead.company,
      subtitle: `${stageLabel(lead.stage)} · ${lead.product} · ${formatCount(lead.quantity)} pcs`,
      href: `/leads/${lead.id}`,
    }));
  const results = [...leadResults, ...pageResults];
  const selectedIndex = Math.min(activeIndex, results.length - 1);

  const openResult = (result: SearchResult | undefined) => {
    if (!result) return;
    router.push(result.href);
    setPaletteOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") setActiveIndex((selectedIndex + 1) % results.length);
    else if (event.key === "ArrowUp") setActiveIndex((selectedIndex - 1 + results.length) % results.length);
    else if (event.key === "Enter") openResult(results[selectedIndex]);
    else if (event.key === "Escape") setPaletteOpen(false);
    else return;
    event.preventDefault();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-[12vh] backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={() => setPaletteOpen(false)}
    >
      <motion.div
        role="dialog"
        aria-label="Search"
        className="w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 36 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <label className="flex items-center gap-3 border-b border-neutral-100 pr-4 pl-3">
          <span className="grid size-8 place-items-center rounded-full bg-black text-white">
            <Search className="size-3.5" />
          </span>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search leads, companies, products…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-400"
          />
          <kbd className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">Esc</kbd>
        </label>

        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {results.map((result, index) => (
            <li key={result.key} role="option" aria-selected={index === selectedIndex}>
              <button
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openResult(result)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-colors ${index === selectedIndex ? "bg-neutral-100" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{result.title}</p>
                  <p className="truncate text-xs text-neutral-500">{result.subtitle}</p>
                </div>
                {index === selectedIndex ? <CornerDownLeft className="size-4 text-neutral-400" /> : <ArrowRight className="size-4 text-neutral-300" />}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-neutral-400">No results for “{query}”</li>}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/** Global search, opened with Ctrl+K / ⌘K or the sidebar button. */
export function CommandPalette() {
  const isOpen = useSyncExternalStore(subscribe, () => isPaletteOpen, () => false);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(!isPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return <AnimatePresence>{isOpen && <PaletteDialog />}</AnimatePresence>;
}
