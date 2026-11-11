"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";

const TOAST_DURATION_MS = 2800;

interface Toast {
  id: number;
  message: string;
}

let toasts: Toast[] = [];
let toastSequence = 0;
const listeners = new Set<() => void>();

function setToasts(next: Toast[]) {
  toasts = next;
  listeners.forEach((notify) => notify());
}

/** Shows a short message at the bottom of the screen. Callable from anywhere on the client. */
export function showToast(message: string) {
  const id = ++toastSequence;
  setToasts([...toasts, { id, message }]);
  setTimeout(() => setToasts(toasts.filter((toast) => toast.id !== id)), TOAST_DURATION_MS);
}

const NO_TOASTS: Toast[] = [];

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function Toaster() {
  const visibleToasts = useSyncExternalStore(subscribe, () => toasts, () => NO_TOASTS);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2" aria-live="polite">
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <motion.p
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            {toast.message}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}
