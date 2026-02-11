"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "error";

const alertStyleMap: Record<AlertVariant, string> = {
  info: "border-zinc-700 bg-zinc-900 text-zinc-200",
  success: "border-emerald-700/70 bg-emerald-950/30 text-emerald-200",
  warning: "border-orange-500/50 bg-orange-950/30 text-orange-200",
  error: "border-red-700/70 bg-red-950/30 text-red-200",
};

const iconMap: Record<AlertVariant, string> = {
  info: "material-symbols:info-outline-rounded",
  success: "material-symbols:check-circle-outline-rounded",
  warning: "material-symbols:warning-outline-rounded",
  error: "material-symbols:error-outline-rounded",
};

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  variant?: AlertVariant;
};

export function Alert({ className, title, variant = "info", children, ...props }: AlertProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 ease-in-out",
        alertStyleMap[variant],
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="iconify mt-0.5 text-xl" data-icon={iconMap[variant]} />
        <div>
          {title ? <p className="text-sm font-semibold text-white">{title}</p> : null}
          <div className="text-sm text-zinc-300">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
