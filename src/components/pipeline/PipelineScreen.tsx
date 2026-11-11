"use client";

import { SearchX, Trophy, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { can } from "@/config/roles";
import { isClosedStage, stageLabel } from "@/config/stages";
import { formatCompactMoney } from "@/lib/format";
import { EMPTY_FILTERS, type PipelineCard, type PipelineFilters, applyFilters, distinctValues, moveBlockedReason, toCard } from "@/lib/pipeline-cards";
import type { StageId } from "@/lib/types";
import { useCrm } from "@/store/crm-store";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { showToast } from "@/components/Toaster";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { type PipelineView, PipelineToolbar, ViewToggle } from "@/components/pipeline/PipelineToolbar";
import { Button, LoadingState, PageHeader, StatCard } from "@/components/ui";

function PipelineStats({ cards }: { cards: PipelineCard[] }) {
  const openValue = cards.filter((card) => !isClosedStage(card.lead.stage)).reduce((sum, card) => sum + card.value, 0);
  const wonValue = cards.filter((card) => card.lead.stage === "WON").reduce((sum, card) => sum + card.value, 0);

  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      <StatCard index={1} icon={Wallet} label="Open pipeline" value={<AnimatedNumber value={openValue} format={formatCompactMoney} />} />
      <StatCard index={2} icon={Trophy} label="Won" value={<AnimatedNumber value={wonValue} format={formatCompactMoney} />} />
    </div>
  );
}

export function PipelineScreen() {
  const { data, role, moveToNextStage } = useCrm();
  const [savedFilters, setFilters] = useState<PipelineFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<PipelineView>("BOARD");

  // A sales person only sees their own deals, so the owner filter applies to Manager and MD only.
  const canFilterByOwner = can(role, "SEE_ALL_DEALS");
  const filters = canFilterByOwner ? savedFilters : { ...savedFilters, owner: "" };

  const allCards = useMemo(() => data?.leads.map((lead) => toCard(lead, data.quotes)) ?? [], [data]);
  const visibleCards = applyFilters(allCards, filters);

  if (!data) return <LoadingState />;

  const openDealCount = visibleCards.filter((card) => !isClosedStage(card.lead.stage)).length;
  const clearFilters = () => setFilters({ ...EMPTY_FILTERS, sort: filters.sort });

  const moveDeal = (card: PipelineCard, targetStage: StageId) => {
    const blockedReason = moveBlockedReason(card, targetStage);
    if (blockedReason) return showToast(blockedReason);
    moveToNextStage(card.lead.id);
    showToast(`${card.lead.company} moved to ${stageLabel(targetStage)}`);
  };

  return (
    <>
      <PageHeader title="Pipeline" subtitle={`${openDealCount} open deals`}>
        <ViewToggle view={view} onViewChange={setView} />
      </PageHeader>

      <PipelineStats cards={visibleCards} />

      <PipelineToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onClear={clearFilters}
        filterOptions={[
          ...(canFilterByOwner ? [{ key: "owner" as const, placeholder: "All owners", values: distinctValues(allCards, (lead) => lead.owner) }] : []),
          { key: "product", placeholder: "All products", values: distinctValues(allCards, (lead) => lead.product) },
        ]}
      />

      {visibleCards.length === 0 ? (
        <div className="animate-enter lift panel flex flex-col items-center py-16 text-center">
          <SearchX className="size-6 text-neutral-400" />
          <p className="mt-3 font-medium">No deals match these filters</p>
          <p className="mt-1 text-sm text-neutral-500">Try a different search or clear the filters.</p>
          <Button variant="secondary" className="mt-5" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : view === "BOARD" ? (
        <KanbanBoard cards={visibleCards} onMove={moveDeal} />
      ) : (
        <PipelineTable cards={visibleCards} />
      )}
    </>
  );
}
