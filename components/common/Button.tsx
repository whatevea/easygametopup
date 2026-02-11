"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-500 text-white font-medium border border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-600 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]",
  secondary:
    "bg-transparent text-zinc-300 border border-zinc-700 hover:border-orange-500 hover:text-orange-500",
  ghost: "bg-transparent text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-white",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", disabled, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
});
