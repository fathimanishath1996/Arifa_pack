"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/website-types";
import { SiteImage, visibleOnly } from "@/components/site/site-ui";

const AUTO_ADVANCE_MS = 6000;

export function HeroSlider({ slides: allSlides }: { slides: HeroSlide[] }) {
  const slides = visibleOnly(allSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;
  const currentIndex = slideCount > 0 ? activeIndex % slideCount : 0;

  useEffect(() => {
    if (slideCount < 2) return;
    const timer = setInterval(() => setActiveIndex((index) => (index + 1) % slideCount), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slideCount, activeIndex]);

  if (slideCount === 0) return null;
  const slide = slides[currentIndex];
  const goTo = (index: number) => setActiveIndex((index + slideCount) % slideCount);

  return (
    <section id="home" className="relative h-[78vh] min-h-[480px] overflow-hidden bg-black text-white">
      <AnimatePresence initial={false}>
        <motion.div key={slide.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <SiteImage src={slide.image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 md:px-6">
        <motion.div key={slide.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-xl">
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight whitespace-pre-line sm:text-5xl md:text-6xl">{slide.title}</h1>
          <p className="mt-6 text-lg text-white/90">{slide.tagline}</p>
          <p className="mt-2 text-white/70">{slide.subtext}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#products" className="press rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-neutral-200">
              {slide.productsButtonLabel}
            </a>
            <a href="#contact" className="press rounded-full border border-white/60 px-6 py-3 text-sm font-semibold hover:border-white hover:bg-white/10">
              {slide.contactButtonLabel}
            </a>
          </div>
        </motion.div>
      </div>

      {slideCount > 1 && (
        <>
          <button onClick={() => goTo(currentIndex - 1)} aria-label="Previous slide" className="press absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 hover:bg-white/10 md:grid">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={() => goTo(currentIndex + 1)} aria-label="Next slide" className="press absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 hover:bg-white/10 md:grid">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goTo(index)}
                aria-label={`Slide ${index + 1}`}
                aria-current={index === currentIndex}
                className={`h-1.5 rounded-full transition-all ${index === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
