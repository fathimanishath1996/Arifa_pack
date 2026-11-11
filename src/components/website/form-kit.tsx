"use client";

import { ArrowDown, ArrowUp, ImageUp, Plus, Trash2 } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { showToast } from "@/components/Toaster";
import { SiteImage } from "@/components/site/site-ui";

/** Uploaded images are kept in the browser for the demo, so keep them small. */
const MAX_UPLOAD_BYTES = 1_500_000;

const FIELD_BASE = "glass w-full px-4 py-2.5 text-sm shadow-sm outline-none transition-all placeholder:text-neutral-400 hover:bg-white/80 focus:bg-white focus:shadow-md";
/** Same glass pill inputs as the CRM. */
export const INPUT = `${FIELD_BASE} rounded-full`;
const TEXTAREA = `${FIELD_BASE} resize-y rounded-3xl`;

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="animate-enter lift panel p-5 md:p-6">
      {(title || actions) && (
        <header className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-medium tracking-tight">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-xs text-neutral-500">{text}</span>
      {children}
    </label>
  );
}

export function TextField({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Label text={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={INPUT} {...props} />
    </Label>
  );
}

export function TextAreaField({ label, value, onChange, hint, ...props }: { label: string; value: string; onChange: (value: string) => void; hint?: string } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return (
    <Label text={label}>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={TEXTAREA} {...props} />
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </Label>
  );
}

/** Shows the current image; replace it by uploading a file or typing a /images/… path. */
export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) return showToast("Image is too large for the demo (max 1.5 MB)");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Label text={label}>
      <div className="flex items-center gap-3">
        <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-2 ring-white transition-transform hover:scale-105">
          <SiteImage src={value} alt="" fill sizes="64px" className="object-contain" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value.startsWith("data:") ? "Uploaded image" : value} onChange={(event) => onChange(event.target.value)} disabled={value.startsWith("data:")} className={`${INPUT} disabled:text-neutral-500`} />
          <span className="press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white/70 px-3.5 py-1.5 text-xs font-medium hover:border-black">
            <ImageUp className="size-3.5" /> Upload image
            <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
          </span>
        </div>
      </div>
    </Label>
  );
}

export function SelectField<Value extends string | number>({ label, value, options, onChange }: { label: string; value: Value; options: { value: Value; label: string }[]; onChange: (value: Value) => void }) {
  return (
    <Label text={label}>
      <select value={value} onChange={(event) => onChange(options[event.target.selectedIndex].value)} className={INPUT}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

export function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="press grid size-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-black disabled:opacity-30">
      {children}
    </button>
  );
}

export function moveItem<Item>(items: Item[], index: number, direction: -1 | 1): Item[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** An editable list of short texts (paragraphs, pillars, bullet points). */
export function StringListField({ label, values, onChange, isMultiline = false, addLabel = "Add" }: { label: string; values: string[]; onChange: (values: string[]) => void; isMultiline?: boolean; addLabel?: string }) {
  const updateAt = (index: number, value: string) => onChange(values.map((item, itemIndex) => (itemIndex === index ? value : item)));

  return (
    <div>
      <p className="mb-1.5 px-1 text-xs text-neutral-500">{label}</p>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-start gap-1">
            {isMultiline ? (
              <textarea value={value} onChange={(event) => updateAt(index, event.target.value)} rows={3} className={TEXTAREA} aria-label={`${label} ${index + 1}`} />
            ) : (
              <input value={value} onChange={(event) => updateAt(index, event.target.value)} className={INPUT} aria-label={`${label} ${index + 1}`} />
            )}
            <IconButton label="Move up" onClick={() => onChange(moveItem(values, index, -1))} disabled={index === 0}>
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton label="Move down" onClick={() => onChange(moveItem(values, index, 1))} disabled={index === values.length - 1}>
              <ArrowDown className="size-4" />
            </IconButton>
            <IconButton label="Remove" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...values, ""])} className="press mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-black">
        <Plus className="size-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/** Short items (pillars, bullet points) as removable chips with an add box, like the tags in the reference. */
export function ChipsField({ label, values, onChange, placeholder = "Add and press Enter" }: { label: string; values: string[]; onChange: (values: string[]) => void; placeholder?: string }) {
  const add = (input: HTMLInputElement) => {
    const value = input.value.trim();
    if (!value) return;
    onChange([...values, value]);
    input.value = "";
  };

  return (
    <div>
      <p className="mb-1.5 px-1 text-xs text-neutral-500">
        {label} <span className="text-neutral-400">({values.length})</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span key={`${value}-${index}`} className="group inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white py-1 pr-1 pl-3 text-xs transition-all hover:border-black hover:shadow-sm">
            {value}
            <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${value}`} className="grid size-5 place-items-center rounded-full text-neutral-400 transition-colors group-hover:bg-black group-hover:text-white">
              <Trash2 className="size-3" />
            </button>
          </span>
        ))}
        <input
          placeholder={placeholder}
          aria-label={`Add to ${label}`}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add(event.currentTarget);
          }}
          onBlur={(event) => add(event.currentTarget)}
          className="min-w-40 flex-1 rounded-full border border-dashed border-neutral-300 bg-transparent px-3 py-1 text-xs outline-none transition-colors placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black"
        />
      </div>
    </div>
  );
}
