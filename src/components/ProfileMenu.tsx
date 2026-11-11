"use client";

import { Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { DEMO_USER_NAME, ROLES, ROLE_LABEL } from "@/config/roles";
import type { Role } from "@/lib/types";
import { useDismiss } from "@/hooks/useDismiss";
import { useCrm } from "@/store/crm-store";
import { showToast } from "@/components/Toaster";
import { Avatar } from "@/components/ui";

/** The signed-in person. In the demo, the menu also switches between the three roles. */
export function ProfileMenu() {
  const { role, setRole, resetData } = useCrm();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(containerRef, isOpen, useCallback(() => setIsOpen(false), []));

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setIsOpen(false);
    if (nextRole !== role) showToast(`Viewing as ${DEMO_USER_NAME[nextRole]} · ${ROLE_LABEL[nextRole]}`);
  };

  return (
    <div ref={containerRef} className="relative">

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="absolute top-full right-0 z-40 mt-2 w-60 rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-black/5 md:top-auto md:bottom-full md:left-0 md:mt-0 md:mb-3 md:w-full"
          >
            <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">Switch role · demo</p>
            {ROLES.map((option) => (
              <button
                key={option}
                role="menuitemradio"
                aria-checked={role === option}
                onClick={() => switchRole(option)}
                className="press flex w-full items-center gap-2.5 rounded-full px-2 py-1.5 text-left hover:bg-neutral-100"
              >
                <Avatar name={DEMO_USER_NAME[option]} inverted={role === option} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{DEMO_USER_NAME[option]}</span>
                  <span className="block text-xs text-neutral-500">{ROLE_LABEL[option]}</span>
                </span>
                {role === option && <Check className="size-4" />}
              </button>
            ))}
            <div className="my-1.5 h-px bg-neutral-100" />
            <button
              role="menuitem"
              onClick={() => {
                resetData();
                setIsOpen(false);
                showToast("Sample data reset");
              }}
              className="press flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-black"
            >
              <RotateCcw className="size-4" /> Reset sample data
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`press relative z-40 flex w-full items-center rounded-full p-1 hover:bg-neutral-100 md:flex-col md:gap-2 md:rounded-3xl md:py-4 ${isOpen ? "bg-neutral-100" : ""}`}
      >
        <span className="md:hidden">
          <Avatar name={DEMO_USER_NAME[role]} size="md" inverted />
        </span>
        <span className="hidden md:block">
          <Avatar name={DEMO_USER_NAME[role]} size="lg" inverted />
        </span>
        <span className="hidden min-w-0 text-center md:block">
          <span className="block truncate text-sm font-semibold">{DEMO_USER_NAME[role]}</span>
          <span className="flex items-center justify-center gap-1 text-xs text-neutral-500">
            {ROLE_LABEL[role]} <ChevronsUpDown className="size-3" />
          </span>
        </span>
      </button>
    </div>
  );
}
