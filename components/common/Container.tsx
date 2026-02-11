import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClassMap: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({ className, size = "lg", ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClassMap[size], className)} {...props} />;
}
