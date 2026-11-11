"use client";

/** Building blocks for the Website Panel. Everything shared with the CRM comes from components/ui. */
import { motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { PageHeader, SegmentedControl, enterDelay } from "@/components/ui";

export { Avatar, Button, PageHeader, SegmentedControl, StatCard, enterDelay, initialsOf } from "@/components/ui";

/** Glass card with a title and an optional black count badge, as on the CRM Today page. */
export function Panel({ title, count, index = 0, actions, children, className = "" }: { title: string; count?: number; index?: number; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`animate-enter lift panel ${className}`} style={enterDelay(index)}>
      <header className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-medium tracking-tight">
          {title}
          {count !== undefined && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-2 text-xs font-semibold text-white tabular-nums transition-transform hover:scale-110">{count}</span>}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}

export interface PageTab {
  label: string;
  content: ReactNode;
}

/** A Website page: CRM-style header (big light title + subtitle), tabs as the pill switch on the right. */
export function EditorPage({ title, subtitle, tabs, children }: { title: string; subtitle?: string; tabs?: PageTab[]; children?: ReactNode }) {
  const [activeLabel, setActiveLabel] = useState(tabs?.[0]?.label ?? "");
  const activeTab = tabs?.find((tab) => tab.label === activeLabel) ?? tabs?.[0];

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        {tabs && <SegmentedControl options={tabs.map((tab) => ({ id: tab.label, label: tab.label }))} value={activeTab?.label ?? ""} onChange={setActiveLabel} label="Sections" />}
      </PageHeader>
      <motion.div key={activeTab?.label ?? "page"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab ? activeTab.content : children}
      </motion.div>
    </div>
  );
}

/** Small round checkbox in black and white, used on every selectable row. */
export function RowCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid size-5 shrink-0 place-items-center rounded-full border transition-all ${checked ? "border-black bg-black text-white" : "border-neutral-300 bg-white/70 hover:scale-110 hover:border-black"}`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <path d="M2.5 6.5l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
