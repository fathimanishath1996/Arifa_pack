"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";

/** Counts smoothly from the previous value to the new one. */
export function AnimatedNumber({ value, format = String }: { value: number; format?: (value: number) => string }) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useMotionValueEvent(motionValue, "change", setDisplayValue);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] });
    return () => controls.stop();
  }, [motionValue, value]);

  // Whole counts stay whole while counting up; money keeps its decimals.
  return <span className="tabular-nums">{format(Number.isInteger(value) ? Math.round(displayValue) : displayValue)}</span>;
}
