"use client";

import { motion } from "motion/react";

/** Templates re-mount on every navigation, so each page fades in smoothly. */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
