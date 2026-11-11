import { DraftPreview } from "@/components/website/DraftPreview";
import { CrmProvider } from "@/store/crm-store";

export const metadata = { title: "Preview · Website" };

/** The draft website, for the Manager and MD before they publish. */
export default function PreviewPage() {
  return (
    <CrmProvider>
      <DraftPreview />
    </CrmProvider>
  );
}
