"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import type { ListItem } from "@/lib/website-types";
import { showToast } from "@/components/Toaster";
import { RowCheckbox, enterDelay } from "@/components/website/website-ui";
import { moveItem } from "@/components/website/form-kit";
import { setSelectionToolbar } from "@/components/website/toolbar-store";
import { SiteImage } from "@/components/site/site-ui";

interface ListEditorProps<Item extends ListItem> {
  title: string;
  items: Item[];
  onChange: (items: Item[]) => void;
  /** Label for the add button, e.g. "Add slide". */
  addLabel: string;
  createItem: () => Item;
  itemTitle: (item: Item) => string;
  itemImage?: (item: Item) => string;
  renderForm: (item: Item, update: (patch: Partial<Item>) => void) => ReactNode;
}

const PANEL_BUTTON = "press inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium disabled:opacity-30";

/** List on the left, the chosen item's editor on the right. Ticked rows get bulk actions in the top toolbar. */
export function ListEditor<Item extends ListItem>({ title, items, onChange, addLabel, createItem, itemTitle, itemImage, renderForm }: ListEditorProps<Item>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const activeItem = items[activeIndex];
  const selected = items.filter((item) => selectedIds.has(item.id));
  const isAllSelected = items.length > 0 && selected.length === items.length;

  const updateItem = (id: string, patch: Partial<Item>) => onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const toggleSelected = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Hand the bulk actions for ticked rows to the top toolbar; remove them when nothing is ticked or the page closes.
  useEffect(() => {
    if (selected.length === 0) return setSelectionToolbar(null);
    const clear = () => setSelectedIds(new Set());
    const setVisibility = (isVisible: boolean) => {
      onChange(items.map((item) => (selectedIds.has(item.id) ? { ...item, isVisible } : item)));
      showToast(`${selected.length} ${isVisible ? "shown" : "hidden"}`);
      clear();
    };
    setSelectionToolbar({
      count: selected.length,
      onClear: clear,
      actions: [
        { label: "Show", icon: Eye, onClick: () => setVisibility(true) },
        { label: "Hide", icon: EyeOff, onClick: () => setVisibility(false) },
        {
          label: "Delete",
          icon: Trash2,
          onClick: () => {
            if (!window.confirm(`Delete ${selected.length} selected?`)) return;
            onChange(items.filter((item) => !selectedIds.has(item.id)));
            showToast(`${selected.length} deleted from draft`);
            clear();
          },
        },
      ],
    });
  }, [items, onChange, selected.length, selectedIds]);
  useEffect(() => () => setSelectionToolbar(null), []);

  const addItem = () => {
    const item = createItem();
    onChange([...items, item]);
    setActiveId(item.id);
  };

  const removeItem = (item: Item) => {
    if (!window.confirm(`Delete "${itemTitle(item) || "this item"}"?`)) return;
    onChange(items.filter((current) => current.id !== item.id));
    showToast("Deleted from draft");
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* List */}
      <section className="animate-enter lift panel pb-4" style={enterDelay(1)}>
        <header className="flex items-center gap-3 px-6 pt-5 pb-3">
          <RowCheckbox checked={isAllSelected} onChange={() => setSelectedIds(isAllSelected ? new Set() : new Set(items.map((item) => item.id)))} label="Select all" />
          <h2 className="flex flex-1 items-center gap-2 text-lg font-medium tracking-tight">
            {title}
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-2 text-xs font-semibold text-white tabular-nums transition-transform hover:scale-110">{items.length}</span>
          </h2>
          <button type="button" onClick={addItem} aria-label={addLabel} title={addLabel} className="press grid size-8 place-items-center rounded-full bg-black text-white shadow-md transition-transform hover:rotate-90">
            <Plus className="size-4" />
          </button>
        </header>

        <ul className="space-y-2 px-4">
          {items.map((item) => {
            const isActive = item.id === activeItem?.id;
            const isSelected = selectedIds.has(item.id);
            return (
              <motion.li key={item.id} layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                <div
                  className={`group flex items-center gap-3 rounded-full border py-1.5 pr-4 pl-2.5 transition-all duration-200 hover:translate-x-1 hover:bg-white/70 hover:shadow-sm ${isActive ? "border-black bg-white/70 shadow-sm" : isSelected ? "border-neutral-400 bg-white/50" : "border-neutral-200 hover:border-neutral-400"}`}
                >
                  <RowCheckbox checked={isSelected} onChange={() => toggleSelected(item.id)} label={`Select ${itemTitle(item) || "item"}`} />
                  <button type="button" onClick={() => setActiveId(item.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-current={isActive}>
                    {itemImage && (
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-2 ring-white transition-transform group-hover:scale-110">
                        <SiteImage src={itemImage(item)} alt="" fill sizes="32px" className="object-cover" />
                      </span>
                    )}
                    <span className={`min-w-0 flex-1 truncate text-sm font-medium ${item.isVisible ? "" : "text-neutral-400"}`}>{itemTitle(item) || "Untitled"}</span>
                    {!item.isVisible && <span className="shrink-0 rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-500">Hidden</span>}
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
        {items.length === 0 && <p className="px-6 py-6 text-sm text-neutral-400">Nothing here yet.</p>}
      </section>

      {/* Editor for the chosen item */}
      <AnimatePresence mode="wait">
        {activeItem && (
          <motion.section
            key={activeItem.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="panel p-5 md:p-6 lg:sticky lg:top-4"
          >
            <header className="mb-5 flex flex-wrap items-center gap-2">
              <h3 className="mr-auto min-w-0 truncate text-lg font-medium tracking-tight">{itemTitle(activeItem) || "Untitled"}</h3>
              <button type="button" onClick={() => updateItem(activeItem.id, { isVisible: !activeItem.isVisible } as Partial<Item>)} className={`${PANEL_BUTTON} border border-neutral-300 bg-white/70 hover:border-black`}>
                {activeItem.isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />} {activeItem.isVisible ? "Visible" : "Hidden"}
              </button>
              <button type="button" onClick={() => onChange(moveItem(items, activeIndex, -1))} disabled={activeIndex === 0} className={`${PANEL_BUTTON} glass hover:bg-white`} aria-label="Move up" title="Move up">
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(moveItem(items, activeIndex, 1))} disabled={activeIndex === items.length - 1} className={`${PANEL_BUTTON} glass hover:bg-white`} aria-label="Move down" title="Move down">
                <ArrowDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => removeItem(activeItem)} className={`${PANEL_BUTTON} glass hover:bg-black hover:text-white`} aria-label="Delete" title="Delete">
                <Trash2 className="size-3.5" />
              </button>
            </header>
            <div className="space-y-4">{renderForm(activeItem, (patch) => updateItem(activeItem.id, patch))}</div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
