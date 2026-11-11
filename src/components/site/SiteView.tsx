"use client";

import { useEffect } from "react";
import type { SiteContent } from "@/lib/website-types";
import { ContactSection } from "@/components/site/ContactSection";
import { HeroSlider } from "@/components/site/HeroSlider";
import { HomeEssentials, Leadership, Services, Sustainability } from "@/components/site/InfoSections";
import { ProductsAbout } from "@/components/site/ProductsAbout";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteImage } from "@/components/site/site-ui";

function SiteFooter({ content }: { content: SiteContent }) {
  const { settings, contact } = content;
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-white p-1">
            <SiteImage src={settings.logo} alt={settings.brandName} width={40} height={40} className="size-10 object-contain" />
          </span>
          <span className="text-sm font-semibold">{contact.divisionName}</span>
        </div>
        <div className="text-sm text-neutral-400 md:text-right">
          <p>{contact.headOfficeAddress}</p>
          <p className="mt-1">
            <a href={`mailto:${contact.divisionEmail}`} className="hover:text-white">
              {contact.divisionEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/** The whole website for a given content version: published on "/", draft in the CMS preview. */
export function SiteView({ content }: { content: SiteContent }) {
  const { pageTitle, metaDescription } = content.settings;

  // Title and description are editable in Site settings, so keep the page in sync.
  useEffect(() => {
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metaDescription);
  }, [pageTitle, metaDescription]);

  return (
    <>
      <SiteHeader settings={content.settings} />
      <main>
        <HeroSlider slides={content.hero} />
        <ProductsAbout about={content.about} products={content.products} brandName={content.settings.brandName} />
        <Sustainability content={content.sustainability} />
        <HomeEssentials content={content.essentials} />
        <Services content={content.services} />
        <Leadership content={content.leadership} />
        <ContactSection content={content.contact} />
      </main>
      <SiteFooter content={content} />
    </>
  );
}
