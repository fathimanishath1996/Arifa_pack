"use client";

import { Card, ChipsField, ImageField, StringListField, TextAreaField, TextField } from "@/components/website/form-kit";
import { ListEditor } from "@/components/website/ListEditor";
import { EditorPage, listSubtitle, newId, useDraftSection, useSectionStatus } from "@/components/website/editors/editor-kit";

const BOLD_HINT = "Wrap words in **double stars** to make them bold.";

export function AboutEditor() {
  const { value: about, patch } = useDraftSection("about");
  const status = useSectionStatus("about");
  return (
    <EditorPage
      title="About"
      subtitle={`${status} · ${about.paragraphs.length} paragraphs · ${about.pillars.length} pillars`}
      tabs={[
        {
          label: "Text",
          content: (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Company name" value={about.companyName} onChange={(companyName) => patch({ companyName })} />
                <TextField label="Heading" value={about.heading} onChange={(heading) => patch({ heading })} />
              </div>
              <TextAreaField label="Intro (after the brand name)" value={about.intro} onChange={(intro) => patch({ intro })} />
              <StringListField label="Paragraphs" values={about.paragraphs} onChange={(paragraphs) => patch({ paragraphs })} isMultiline addLabel="Add paragraph" />
            </Card>
          ),
        },
        {
          label: "Image & pillars",
          content: (
            <Card>
              <ImageField label="Image" value={about.image} onChange={(image) => patch({ image })} />
              <ChipsField label="Pillars" values={about.pillars} onChange={(pillars) => patch({ pillars })} />
            </Card>
          ),
        },
      ]}
    />
  );
}

export function SustainabilityEditor() {
  const { value: section, patch } = useDraftSection("sustainability");
  const status = useSectionStatus("sustainability");
  return (
    <EditorPage
      title="Sustainability"
      subtitle={listSubtitle(status, section.features)}
      tabs={[
        {
          label: "Features",
          content: (
            <ListEditor
              title="Features"
              items={section.features}
              onChange={(features) => patch({ features })}
              addLabel="Add feature"
              itemTitle={(feature) => feature.title}
              createItem={() => ({ id: newId("feature"), isVisible: true, title: "", text: "" })}
              renderForm={(feature, update) => (
                <>
                  <TextField label="Title" value={feature.title} onChange={(title) => update({ title })} />
                  <TextAreaField label="Text" value={feature.text} onChange={(text) => update({ text })} rows={5} hint={BOLD_HINT} />
                </>
              )}
            />
          ),
        },
        {
          label: "Heading & figure",
          content: (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Small heading" value={section.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
                <TextField label="Heading" value={section.heading} onChange={(heading) => patch({ heading })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <TextField label="Figure" value={section.statValue} onChange={(statValue) => patch({ statValue })} />
                <TextField label="Figure text" value={section.statText} onChange={(statText) => patch({ statText })} />
              </div>
            </Card>
          ),
        },
      ]}
    />
  );
}

export function EssentialsEditor() {
  const { value: section, patch } = useDraftSection("essentials");
  const status = useSectionStatus("essentials");
  return (
    <EditorPage
      title="Home Essentials"
      subtitle={listSubtitle(status, section.categories)}
      tabs={[
        {
          label: "Categories",
          content: (
            <ListEditor
              title="Categories"
              items={section.categories}
              onChange={(categories) => patch({ categories })}
              addLabel="Add category"
              itemTitle={(category) => category.title}
              itemImage={(category) => category.icon}
              createItem={() => ({ id: newId("category"), isVisible: true, title: "", icon: section.categories[0]?.icon ?? "/images/icons/eco-icon.png", items: [] })}
              renderForm={(category, update) => (
                <>
                  <TextField label="Title" value={category.title} onChange={(title) => update({ title })} />
                  <ImageField label="Icon" value={category.icon} onChange={(icon) => update({ icon })} />
                  <ChipsField label="Points" values={category.items} onChange={(items) => update({ items })} />
                </>
              )}
            />
          ),
        },
        {
          label: "Heading",
          content: (
            <Card>
              <TextField label="Heading" value={section.heading} onChange={(heading) => patch({ heading })} />
            </Card>
          ),
        },
      ]}
    />
  );
}

export function ServicesEditor() {
  const { value: section, patch } = useDraftSection("services");
  const status = useSectionStatus("services");
  return (
    <EditorPage
      title="Services"
      subtitle={listSubtitle(status, section.services)}
      tabs={[
        {
          label: "Services",
          content: (
            <ListEditor
              title="Services"
              items={section.services}
              onChange={(services) => patch({ services })}
              addLabel="Add service"
              itemTitle={(service) => service.title}
              createItem={() => ({ id: newId("service"), isVisible: true, title: "", text: "" })}
              renderForm={(service, update) => (
                <>
                  <TextField label="Title" value={service.title} onChange={(title) => update({ title })} />
                  <TextAreaField label="Text" value={service.text} onChange={(text) => update({ text })} rows={8} hint={BOLD_HINT} />
                </>
              )}
            />
          ),
        },
        {
          label: "Heading & button",
          content: (
            <Card>
              <TextField label="Heading" value={section.heading} onChange={(heading) => patch({ heading })} />
              <TextAreaField label="Intro" value={section.intro} onChange={(intro) => patch({ intro })} />
              <TextField label="Button" value={section.buttonLabel} onChange={(buttonLabel) => patch({ buttonLabel })} />
            </Card>
          ),
        },
      ]}
    />
  );
}
