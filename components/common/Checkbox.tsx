"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.label
      whileHover={{ x: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      htmlFor={checkboxId}
      className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-300", className)}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 accent-orange-500 transition-all duration-300 ease-in-out focus:ring-1 focus:ring-orange-500"
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </motion.label>
  );
}
