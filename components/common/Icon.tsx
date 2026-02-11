import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  return <span className={cn("iconify text-lg", className)} data-icon={name} aria-hidden="true" />;
}
