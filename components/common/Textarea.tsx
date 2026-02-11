"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <motion.textarea
        ref={ref}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "min-h-24 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-300 ease-in-out focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500",
          className,
        )}
        {...props}
      />
    );
  },
);
