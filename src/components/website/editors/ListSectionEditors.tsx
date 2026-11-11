"use client";

import { Card, ImageField, SelectField, TextAreaField, TextField } from "@/components/website/form-kit";
import { ListEditor } from "@/components/website/ListEditor";
import { EditorPage, listSubtitle, newId, useDraftSection, useSectionStatus } from "@/components/website/editors/editor-kit";

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((stars) => ({ value: stars, label: `${stars} ${stars === 1 ? "star" : "stars"}` }));
const PLACEHOLDER_IMAGE = "/images/logo/logo-600-600.png";

export function HeroEditor() {
  const { value: slides, setValue } = useDraftSection("hero");
  const status = useSectionStatus("hero");
  return (
    <EditorPage title="Hero slides" subtitle={listSubtitle(status, slides)}>
      <ListEditor
        title="Slides"
        items={slides}
        onChange={setValue}
        addLabel="Add slide"
        itemTitle={(slide) => slide.title.replace(/\n/g, " ")}
        itemImage={(slide) => slide.image}
        createItem={() => ({ id: newId("slide"), isVisible: true, title: "", tagline: "", subtext: "", image: slides[0]?.image ?? PLACEHOLDER_IMAGE, productsButtonLabel: "Our Products", contactButtonLabel: "Contact Us" })}
        renderForm={(slide, update) => (
          <>
            <TextAreaField label="Title" value={slide.title} onChange={(title) => update({ title })} hint="Each line shows on its own line." />
            <TextField label="Tagline" value={slide.tagline} onChange={(tagline) => update({ tagline })} />
            <TextField label="Subtext" value={slide.subtext} onChange={(subtext) => update({ subtext })} />
            <ImageField label="Background image" value={slide.image} onChange={(image) => update({ image })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Products button" value={slide.productsButtonLabel} onChange={(productsButtonLabel) => update({ productsButtonLabel })} />
              <TextField label="Contact button" value={slide.contactButtonLabel} onChange={(contactButtonLabel) => update({ contactButtonLabel })} />
            </div>
          </>
        )}
      />
    </EditorPage>
  );
}

export function ProductsEditor() {
  const { value: products, setValue } = useDraftSection("products");
  const { value: about, patch: patchAbout } = useDraftSection("about");
  const status = useSectionStatus("products");
  return (
    <EditorPage
      title="Products"
      subtitle={listSubtitle(status, products)}
      tabs={[
        {
          label: "Products",
          content: (
            <ListEditor
              title="Products"
              items={products}
              onChange={setValue}
              addLabel="Add product"
              itemTitle={(product) => product.name}
              itemImage={(product) => product.image}
              createItem={() => ({ id: newId("product"), isVisible: true, name: "", rating: 5, description: "", image: PLACEHOLDER_IMAGE })}
              renderForm={(product, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
                    <TextField label="Name" value={product.name} onChange={(name) => update({ name })} />
                    <SelectField label="Rating" value={product.rating} options={RATING_OPTIONS} onChange={(rating) => update({ rating })} />
                  </div>
                  <TextAreaField label="Description" value={product.description} onChange={(description) => update({ description })} />
                  <ImageField label="Image" value={product.image} onChange={(image) => update({ image })} />
                </>
              )}
            />
          ),
        },
        {
          label: "Heading",
          content: (
            <Card>
              <TextField label="Section heading" value={about.productsHeading} onChange={(productsHeading) => patchAbout({ productsHeading })} />
            </Card>
          ),
        },
      ]}
    />
  );
}

export function LeadershipEditor() {
  const { value: leadership, patch } = useDraftSection("leadership");
  const status = useSectionStatus("leadership");
  return (
    <EditorPage
      title="Leadership"
      subtitle={listSubtitle(status, leadership.members)}
      tabs={[
        {
          label: "Members",
          content: (
            <ListEditor
              title="Team members"
              items={leadership.members}
              onChange={(members) => patch({ members })}
              addLabel="Add member"
              itemTitle={(member) => member.name}
              itemImage={(member) => member.photo}
              createItem={() => ({ id: newId("member"), isVisible: true, name: "", role: "", photo: PLACEHOLDER_IMAGE })}
              renderForm={(member, update) => (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Name" value={member.name} onChange={(name) => update({ name })} />
                    <TextField label="Role" value={member.role} onChange={(role) => update({ role })} />
                  </div>
                  <ImageField label="Photo" value={member.photo} onChange={(photo) => update({ photo })} />
                </>
              )}
            />
          ),
        },
        {
          label: "Heading",
          content: (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Small heading" value={leadership.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} />
                <TextField label="Heading" value={leadership.heading} onChange={(heading) => patch({ heading })} />
              </div>
            </Card>
          ),
        },
      ]}
    />
  );
}
