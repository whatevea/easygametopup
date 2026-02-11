import { cn } from "@/lib/cn";

export function Divider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-4 border-zinc-800", className)} {...props} />;
}
