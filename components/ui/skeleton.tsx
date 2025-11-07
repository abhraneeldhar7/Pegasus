import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-foreground/40 animate-pulse rounded-[5px]", className)}
      {...props}
    />
  )
}

export { Skeleton }
