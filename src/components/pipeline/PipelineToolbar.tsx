"use client";

import { Columns3, List, Search, X } from "lucide-react";
import { type PipelineFilters, type PipelineSort, hasActiveFilters } from "@/lib/pipeline-cards";
import { SegmentedControl } from "@/components/ui";

export type PipelineView = "BOARD" | "TABLE";

interface FilterOption {
  key: "owner" | "product";
  placeholder: string;
  values: string[];
}

const SORT_LABEL: Record<PipelineSort, string> = {
  DEFAULT: "Sort: Default",
  VALUE: "Sort: Highest value",
  DUE: "Sort: Due soonest",
};

const VIEWS = [
  { id: "BOARD", label: "Board", icon: Columns3 },
  { id: "TABLE", label: "Table", icon: List },
] as const;

const CONTROL = "glass h-10 rounded-full text-sm shadow-sm transition-[background-color,box-shadow,border-color] outline-none hover:bg-white hover:shadow-md focus:border-black";

interface PipelineToolbarProps {
  filters: PipelineFilters;
  filterOptions: FilterOption[];
  onFiltersChange: (filters: PipelineFilters) => void;
  onClear: () => void;
}

/** One row of controls that scopes the stats, the board and the table together. */
export function PipelineToolbar({ filters, filterOptions, onFiltersChange, onClear }: PipelineToolbarProps) {
  const update = (patch: Partial<PipelineFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="animate-enter sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 px-1 py-2.5 md:-mx-4 md:px-4">
      <label className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search deals"
          className={`${CONTROL} w-full pr-4 pl-10 placeholder:text-neutral-400`}
        />
      </label>

      {filterOptions.map((option) => (
        <select
          key={option.key}
          value={filters[option.key]}
          onChange={(event) => update({ [option.key]: event.target.value })}
          aria-label={option.placeholder}
          className={`${CONTROL} min-w-0 flex-1 px-4 sm:flex-none ${filters[option.key] ? "border-black font-medium" : "text-neutral-600"}`}
        >
          <option value="">{option.placeholder}</option>
          {option.values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      ))}

      <select value={filters.sort} onChange={(event) => update({ sort: event.target.value as PipelineSort })} aria-label="Sort deals" className={`${CONTROL} min-w-0 flex-1 px-4 text-neutral-600 sm:flex-none`}>
        {Object.entries(SORT_LABEL).map(([sort, label]) => (
          <option key={sort} value={sort}>
            {label}
          </option>
        ))}
      </select>

      {hasActiveFilters(filters) && (
        <button onClick={onClear} className="press flex h-10 items-center gap-1 rounded-full px-4 text-sm text-neutral-500 transition-colors hover:bg-white/60 hover:text-black">
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

export function ViewToggle({ view, onViewChange }: { view: PipelineView; onViewChange: (view: PipelineView) => void }) {
  return <SegmentedControl options={VIEWS} value={view} onChange={onViewChange} label="View" />;
}
