"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  highlight?: boolean;
};

export function Card({ className, highlight = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all duration-300 ease-in-out hover:border-zinc-700",
        highlight &&
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-gradient-to-b before:from-orange-500/10 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-zinc-100", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-zinc-400", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-zinc-300", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center gap-2", className)} {...props} />;
}
