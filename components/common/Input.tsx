"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon, ...props },
  ref,
) {
  return (
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="relative">
      {icon ? <span className="iconify pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" data-icon={icon} /> : null}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-300 ease-in-out focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
          icon && "pl-10",
          className,
        )}
        {...props}
      />
    </motion.div>
  );
});
