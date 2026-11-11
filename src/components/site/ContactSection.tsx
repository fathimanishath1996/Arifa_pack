"use client";

import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import type { ContactSection as ContactContent } from "@/lib/website-types";
import { sendContactMessage } from "@/store/website-store";
import { showToast } from "@/components/Toaster";
import { SectionHeading } from "@/components/site/site-ui";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };
const FIELD = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black";

function InfoLine({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">{label}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}

/** Section 7: Contact. Messages sent here appear in the CMS Messages inbox. */
export function ContactSection({ content }: { content: ContactContent }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const update = (field: keyof typeof EMPTY_FORM) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendContactMessage({ name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() });
    setForm(EMPTY_FORM);
    showToast("Thank you, your message has been sent");
  };

  return (
    <section id="contact" className="bg-neutral-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading eyebrow={content.eyebrow} title={content.heading} />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
            <InfoLine icon={MapPin} label="Head Office">
              {content.headOfficeAddress}
            </InfoLine>
            <InfoLine icon={Phone} label="Phone">
              <a href={`tel:${content.headOfficePhone.replace(/\s/g, "")}`} className="hover:underline">
                TEL: {content.headOfficePhone}
              </a>
            </InfoLine>
            <InfoLine icon={Mail} label="Email">
              <a href={`mailto:${content.headOfficeEmail}`} className="hover:underline">
                {content.headOfficeEmail}
              </a>
            </InfoLine>
            <InfoLine icon={Building2} label="Packaging Division">
              <p className="font-medium">{content.divisionName}</p>
              <p className="text-neutral-600">{content.divisionAddress}</p>
              <a href={`tel:${content.divisionPhone.replace(/\s/g, "")}`} className="block text-neutral-600 hover:underline">
                PACK TEL: {content.divisionPhone}
              </a>
              <a href={`mailto:${content.divisionEmail}`} className="block text-neutral-600 hover:underline">
                EMAIL: {content.divisionEmail}
              </a>
            </InfoLine>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <input required value={form.name} onChange={update("name")} placeholder="Your Name" aria-label="Your Name" className={FIELD} />
              <input required type="email" value={form.email} onChange={update("email")} placeholder="Your Email" aria-label="Your Email" className={FIELD} />
            </div>
            <input value={form.subject} onChange={update("subject")} placeholder="Subject" aria-label="Subject" className={FIELD} />
            <textarea required rows={5} value={form.message} onChange={update("message")} placeholder="Your Message" aria-label="Your Message" className={`${FIELD} resize-none`} />
            <button type="submit" className="press w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 sm:w-auto">
              {content.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
