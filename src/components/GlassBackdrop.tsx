/**
 * Soft 3D white shapes fixed behind the app, like the studio objects in the reference.
 * The frosted panels blur whatever sits behind them, which is what makes the glass visible.
 */
const SHAPES = [
  "glass-sphere -top-40 -right-32 size-[34rem]",
  "glass-sphere -bottom-48 left-[8%] size-[28rem]",
  "glass-sphere top-[38%] left-[46%] size-44",
  "glass-capsule top-[30%] -left-40 h-56 w-[38rem] -rotate-[24deg]",
  "glass-capsule -right-24 bottom-[12%] h-40 w-[26rem] rotate-[32deg]",
];

export function GlassBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {SHAPES.map((shape) => (
        <span key={shape} className={`absolute rounded-full ${shape}`} />
      ))}
    </div>
  );
}
