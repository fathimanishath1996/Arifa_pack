"use client";

import { Card, ImageField, TextAreaField, TextField } from "@/components/website/form-kit";
import { EditorPage, useDraftSection, useSectionStatus } from "@/components/website/editors/editor-kit";

export function ContactEditor() {
  const { value: contact, patch } = useDraftSection("contact");
  const status = useSectionStatus("contact");
  return (
    <EditorPage
      title="Contact"
      subtitle={`${status} · ${contact.divisionEmail}`}
      tabs={[
        {
          label: "Head Office",
          content: (
            <Card>
              <TextField label="Address" value={contact.headOfficeAddress} onChange={(headOfficeAddress) => patch({ headOfficeAddress })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Phone" value={contact.headOfficePhone} onChange={(headOfficePhone) => patch({ headOfficePhone })} inputMode="tel" />
                <TextField label="Email" value={contact.headOfficeEmail} onChange={(headOfficeEmail) => patch({ headOfficeEmail })} type="email" />
              </div>
            </Card>
          ),
        },
        {
          label: "Packaging Division",
          content: (
            <Card>
              <TextField label="Company name" value={contact.divisionName} onChange={(divisionName) => patch({ divisionName })} />
              <TextField label="Address" value={contact.divisionAddress} onChange={(divisionAddress) => patch({ divisionAddress })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Phone" value={contact.divisionPhone} onChange={(divisionPhone) => patch({ divisionPhone })} inputMode="tel" />
                <TextField label="Email" value={contact.divisionEmail} onChange={(divisionEmail) => patch({ divisionEmail })} type="email" />
              </div>
            </Card>
          ),
        },
        {
          label: "Headings & form",
          content: (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Small heading" value={contact.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
                <TextField label="Heading" value={contact.heading} onChange={(heading) => patch({ heading })} />
              </div>
              <TextField label="Send button" value={contact.submitLabel} onChange={(submitLabel) => patch({ submitLabel })} />
            </Card>
          ),
        },
      ]}
    />
  );
}

export function SettingsEditor() {
  const { value: settings, patch } = useDraftSection("settings");
  const status = useSectionStatus("settings");
  return (
    <EditorPage
      title="Site settings"
      subtitle={status}
      tabs={[
        {
          label: "Brand",
          content: (
            <Card>
              <TextField label="Brand name" value={settings.brandName} onChange={(brandName) => patch({ brandName })} />
              <ImageField label="Logo" value={settings.logo} onChange={(logo) => patch({ logo })} />
            </Card>
          ),
        },
        {
          label: "Search engines",
          content: (
            <Card>
              <TextField label="Page title" value={settings.pageTitle} onChange={(pageTitle) => patch({ pageTitle })} />
              <TextAreaField label="Description" value={settings.metaDescription} onChange={(metaDescription) => patch({ metaDescription })} />
            </Card>
          ),
        },
      ]}
    />
  );
}
