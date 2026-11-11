import type { StageId } from "@/lib/types";

export const STAGES: { id: StageId; label: string }[] = [
  { id: "NEW", label: "New" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "QUOTATION", label: "Quotation" },
  { id: "NEGOTIATION", label: "Negotiation" },
  { id: "READY_TO_CLOSE", label: "Ready to close" },
  { id: "PAYMENT", label: "Payment" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
];

/** The normal order a deal moves in. LOST can happen from any open stage. */
const STAGE_FLOW: StageId[] = ["NEW", "QUALIFIED", "QUOTATION", "NEGOTIATION", "READY_TO_CLOSE", "PAYMENT", "WON"];

export function stageLabel(stage: StageId): string {
  return STAGES.find((item) => item.id === stage)?.label ?? stage;
}

export function nextStageOf(stage: StageId): StageId | null {
  const position = STAGE_FLOW.indexOf(stage);
  return position === -1 || position === STAGE_FLOW.length - 1 ? null : STAGE_FLOW[position + 1];
}

export function isClosedStage(stage: StageId): boolean {
  return stage === "WON" || stage === "LOST";
}
