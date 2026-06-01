import { cn } from "@/lib/utils";

// Shimmer placeholder. Uses the same muted token as the rest of the UI.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
