import { Suspense } from "react";
import { LeadDetail } from "@/components/LeadDetail";
import { LoadingState } from "@/components/ui";
import { MOCK_LEAD_IDS } from "@/data/mock-data";

export function generateStaticParams() {
  return MOCK_LEAD_IDS.map((id) => ({ id }));
}

export default function LeadPage({ params }: PageProps<"/leads/[id]">) {
  // The id comes from the URL, so it is read inside Suspense to keep navigation instant.
  return (
    <Suspense fallback={<LoadingState />}>
      {params.then(({ id }) => (
        <LeadDetail id={id} />
      ))}
    </Suspense>
  );
}
