"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger";

const variantClassMap: Record<BadgeVariant, string> = {
  default: "border-zinc-700 bg-zinc-900 text-zinc-300",
  success: "border-emerald-700/70 bg-emerald-950/40 text-emerald-300",
  warning: "border-orange-500/60 bg-orange-950/30 text-orange-300",
  danger: "border-red-700/70 bg-red-950/30 text-red-300",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <motion.span
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-300 ease-in-out",
        variantClassMap[variant],
        className,
      )}
      {...props}
    />
  );
}
