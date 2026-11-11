import { APPROVAL_WINDOW_HOURS } from "@/config/settings";

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const WINDOW_MS = APPROVAL_WINDOW_HOURS * 3_600_000;

/** Ring that fills as the approval window runs out. Fully black once overdue. */
export function ApprovalTimerRing({ deadline, now }: { deadline: string; now: number }) {
  const remainingMs = new Date(deadline).getTime() - now;
  const usedShare = Math.min(1, Math.max(0, 1 - remainingMs / WINDOW_MS));
  const isOverdue = remainingMs <= 0;

  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0 -rotate-90" role="img" aria-label={isOverdue ? "Approval overdue" : `${Math.round(usedShare * 100)}% of approval time used`}>
      <circle cx="14" cy="14" r={RADIUS} fill="none" strokeWidth="3" className="stroke-neutral-200" />
      <circle
        cx="14"
        cy="14"
        r={RADIUS}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - usedShare)}
        className="stroke-black transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  );
}
