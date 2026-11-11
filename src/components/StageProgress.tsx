import { STAGES } from "@/config/stages";
import type { StageId } from "@/lib/types";

const OPEN_STAGES = STAGES.filter((stage) => stage.id !== "LOST");

/** A step bar showing how far the deal has come. A lost deal stays grey from the stage it was lost at. */
export function StageProgress({ stage }: { stage: StageId }) {
  const currentIndex = OPEN_STAGES.findIndex((item) => item.id === stage);
  const isLost = stage === "LOST";

  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Deal progress">
      {OPEN_STAGES.map((item, index) => {
        const isDone = !isLost && index <= currentIndex;
        const isCurrent = !isLost && index === currentIndex;
        return (
          <li key={item.id} aria-current={isCurrent ? "step" : undefined} className="group cursor-default">
            <div className={`h-1.5 rounded-full transition-all duration-300 group-hover:scale-y-150 ${isDone ? "bg-black" : "bg-neutral-200 group-hover:bg-neutral-400"}`} />
            <p className={`mt-2 hidden truncate text-[11px] transition-colors group-hover:text-black sm:block ${isCurrent ? "font-semibold text-black" : isDone ? "text-neutral-600" : "text-neutral-400"}`}>
              {item.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
