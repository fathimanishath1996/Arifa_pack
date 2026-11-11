import Image, { type ImageProps } from "next/image";
import { Fragment, type ReactNode } from "react";

/** next/image that also accepts images uploaded in the CMS (data URLs are shown as they are). */
export function SiteImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  if (!src) return null;
  return <Image src={src} alt={alt} unoptimized={src.startsWith("data:")} {...props} />;
}

/** Shows text wrapped in **double stars** in bold, so editors can emphasise words without HTML. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

export function SectionHeading({ eyebrow, title, intro, isCentered = true }: { eyebrow?: string; title: string; intro?: ReactNode; isCentered?: boolean }) {
  return (
    <header className={`mb-12 ${isCentered ? "mx-auto max-w-2xl text-center" : ""}`}>
      {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-neutral-600">{intro}</p>}
    </header>
  );
}

export const visibleOnly = <Item extends { isVisible: boolean }>(items: Item[]) => items.filter((item) => item.isVisible);
