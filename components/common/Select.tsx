"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 pr-10 text-sm text-zinc-100 transition-all duration-300 ease-in-out focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        className="iconify pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
        data-icon="material-symbols:keyboard-arrow-down-rounded"
      />
    </motion.div>
  );
});
