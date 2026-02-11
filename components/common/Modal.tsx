"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/common/Button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={(event) => event.stopPropagation()}
            className={cn("w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-5", className)}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              {title ? <h3 className="text-lg font-semibold text-zinc-100">{title}</h3> : <span />}
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close modal"
                className="p-1.5"
                onClick={onClose}
              >
                <span className="iconify text-xl" data-icon="material-symbols:close-rounded" />
              </Button>
            </div>
            <div className="text-sm text-zinc-300">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
