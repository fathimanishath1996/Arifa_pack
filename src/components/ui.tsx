import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { stageLabel } from "@/config/stages";
import type { StageId } from "@/lib/types";

type ButtonVariant = "primary" | "secondary";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-black text-white shadow-md hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none",
  secondary: "border border-neutral-300 bg-white/70 text-black backdrop-blur hover:border-black disabled:text-neutral-400",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`press inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium disabled:cursor-not-allowed ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}

/** Stagger index for the `animate-enter` utility. */
export const enterDelay = (index: number) => ({ "--enter-index": index }) as CSSProperties;

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="animate-enter mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  index?: number;
  icon?: LucideIcon;
}

export function StatCard({ label, value, index = 0, icon: Icon }: StatCardProps) {
  return (
    <div className="group animate-enter lift panel flex items-center gap-3 p-4" style={enterDelay(index)}>
      {Icon && (
        <span className="hidden size-10 shrink-0 place-items-center rounded-full border border-neutral-200 transition-all sm:grid duration-300 group-hover:rotate-[-8deg] group-hover:border-black group-hover:bg-black group-hover:text-white">
          <Icon className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-neutral-500">{label}</p>
        <div className="mt-0.5 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</div>
      </div>
    </div>
  );
}

/** Pill-shaped switch between a few options, like Day / Week / Month. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="flex rounded-full bg-black/5 p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          className={`press flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ${value === option.id ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"}`}
        >
          {option.icon && <option.icon className="size-3.5" />} {option.label}
        </button>
      ))}
    </div>
  );
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const AVATAR_SIZE = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-12 text-base" } as const;

export function Avatar({ name, size = "sm", inverted = false }: { name: string; size?: keyof typeof AVATAR_SIZE; inverted?: boolean }) {
  const sizeStyle = AVATAR_SIZE[size];
  const colourStyle = inverted ? "bg-black text-white ring-2 ring-white" : "bg-neutral-200 text-neutral-800 ring-2 ring-white";
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-semibold transition-transform duration-200 hover:scale-110 ${sizeStyle} ${colourStyle}`} title={name}>
      {initialsOf(name)}
    </span>
  );
}

export function StageTag({ stage }: { stage: StageId }) {
  const isWon = stage === "WON";
  return (
    <span className={`inline-flex h-7 cursor-default items-center rounded-full px-3 text-xs font-medium transition-colors hover:bg-black hover:text-white ${isWon ? "bg-black text-white" : "bg-neutral-100 text-black"}`}>
      {stageLabel(stage)}
    </span>
  );
}

export function Section({ title, children, index = 0 }: { title: string; children: ReactNode; index?: number }) {
  return (
    <section className="animate-enter lift panel p-6" style={enterDelay(index)}>
      <h2 className="mb-5 text-lg font-medium tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

/** Label / value pairs in a clean two-column grid. Empty values are skipped. */
export function DetailList({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items
        .filter(([, value]) => value !== undefined && value !== null && value !== false && value !== "")
        .map(([label, value]) => (
          <div key={label} className="-mx-2 rounded-xl px-2 py-1 transition-colors hover:bg-black/[0.04]">
            <dt className="text-xs text-neutral-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-64 animate-pulse rounded-full bg-neutral-300/50" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-[74px] animate-pulse rounded-[1.75rem] bg-white/60" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[1.75rem] bg-white/50" />
    </div>
  );
}
