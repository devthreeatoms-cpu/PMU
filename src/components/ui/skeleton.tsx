import { cn } from "@/lib/utils";

/**
 * Base skeleton block. Pulses with a subtle neutral tint so it reads as
 * "content loading" on both the white and brand-cream backgrounds.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
