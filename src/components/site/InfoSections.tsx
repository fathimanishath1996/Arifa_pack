import { Check } from "lucide-react";
import type { EssentialsSection, LeadershipSection, ServicesSection, SustainabilitySection } from "@/lib/website-types";
import { RichText, SectionHeading, SiteImage, visibleOnly } from "@/components/site/site-ui";

/** Section 3: sustainability figure and the four features. */
export function Sustainability({ content }: { content: SustainabilitySection }) {
  return (
    <section id="sustainability" className="bg-black py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1fr_1.4fr] md:px-6">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">{content.eyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{content.heading}</h2>
          <p className="mt-10 text-7xl font-semibold tracking-tight">{content.statValue}</p>
          <p className="mt-3 max-w-sm text-neutral-300">{content.statText}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleOnly(content.features).map((feature) => (
            <article key={feature.id} className="rounded-2xl border border-white/15 p-6 transition-colors hover:border-white/40">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">
                <RichText text={feature.text} />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Section 4: Home Essentials Collection. */
export function HomeEssentials({ content }: { content: EssentialsSection }) {
  return (
    <section id="essentials" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <SectionHeading title={content.heading} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleOnly(content.categories).map((category) => (
          <article key={category.id} className="lift rounded-2xl border border-neutral-200 p-6">
            <div className="relative mb-5 size-14">
              <SiteImage src={category.icon} alt="" fill sizes="56px" className="object-contain grayscale" />
            </div>
            <h3 className="font-semibold">{category.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {category.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-neutral-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-black" /> {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Section 5: Our Services. */
export function Services({ content }: { content: ServicesSection }) {
  return (
    <section id="services" className="bg-neutral-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading title={content.heading} intro={content.intro} />
        <div className="grid gap-5 md:grid-cols-2">
          {visibleOnly(content.services).map((service, index) => (
            <article key={service.id} className="lift rounded-2xl border border-neutral-200 bg-white p-8">
              <p className="text-sm font-semibold text-neutral-400">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold">{service.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                <RichText text={service.text} />
              </p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="#contact" className="press inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
            {content.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Section 6: Leadership. */
export function Leadership({ content }: { content: LeadershipSection }) {
  return (
    <section id="leadership" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <SectionHeading eyebrow={content.eyebrow} title={content.heading} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleOnly(content.members).map((member) => (
          <article key={member.id} className="group">
            <div className="relative aspect-[600/650] overflow-hidden rounded-2xl bg-neutral-100">
              <SiteImage src={member.photo} alt={member.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
            </div>
            <h3 className="mt-4 font-semibold">{member.name}</h3>
            <p className="text-sm text-neutral-500">{member.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
