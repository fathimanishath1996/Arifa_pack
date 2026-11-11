"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import type { AboutSection, Product } from "@/lib/website-types";
import { SiteImage, visibleOnly } from "@/components/site/site-ui";

const MAX_RATING = 5;

function Rating({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of ${MAX_RATING} stars`}>
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star key={index} className={`size-3.5 ${index < value ? "fill-black text-black" : "text-neutral-300"}`} />
      ))}
    </span>
  );
}

function ProductCarousel({ heading, products }: { heading: string; products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (direction: 1 | -1) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div id="products" className="mb-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h2>
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} aria-label="Previous products" className="press grid size-10 place-items-center rounded-full border border-neutral-300 hover:border-black">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => scrollBy(1)} aria-label="Next products" className="press grid size-10 place-items-center rounded-full border border-neutral-300 hover:border-black">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {products.map((product) => (
          <article key={product.id} className="lift w-64 shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-neutral-50">
              <SiteImage src={product.image} alt={product.name} fill sizes="256px" className="object-contain p-4" />
            </div>
            <h3 className="font-semibold">{product.name}</h3>
            <div className="mt-1.5">
              <Rating value={product.rating} />
            </div>
            <p className="mt-2 text-sm text-neutral-600">{product.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Section 2 on arifapack.com: the "Our Products" carousel followed by the company introduction. */
export function ProductsAbout({ about, products, brandName }: { about: AboutSection; products: Product[]; brandName: string }) {
  const visibleProducts = visibleOnly(products);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      {visibleProducts.length > 0 && <ProductCarousel heading={about.productsHeading} products={visibleProducts} />}

      <div id="about" className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">{about.companyName}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{about.heading}</h2>
          <p className="mt-6 text-neutral-700">
            <strong className="text-black">{brandName}</strong> {about.intro}
          </p>
          {about.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-4 text-neutral-600">
              {paragraph}
            </p>
          ))}
          <ul className="mt-8 flex flex-wrap gap-2">
            {about.pillars.map((pillar) => (
              <li key={pillar} className="rounded-full border border-black px-4 py-2 text-sm font-medium">
                {pillar}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[585/598] overflow-hidden rounded-3xl bg-neutral-100">
          <SiteImage src={about.image} alt={`About ${brandName}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
