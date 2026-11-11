"use client";

import type { LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

export interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

/** While rows are ticked, the black toolbar in the top bar shows actions for them (like the reference). */
export interface SelectionToolbar {
  count: number;
  actions: ToolbarAction[];
  onClear: () => void;
}

let selection: SelectionToolbar | null = null;
const listeners = new Set<() => void>();

export function setSelectionToolbar(next: SelectionToolbar | null) {
  selection = next;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function useSelectionToolbar(): SelectionToolbar | null {
  return useSyncExternalStore(subscribe, () => selection, () => null);
}
