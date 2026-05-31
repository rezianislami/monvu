import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full bg-clip-padding font-mono text-sm font-bold whitespace-nowrap transition-all duration-100 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Neo-brutalist press buttons (DESIGN.md §5.7): border + hard shadow,
        // shadow shrinks & element translates on hover/active.
        default:
          "bg-[var(--nb-pink)] text-white border-2 border-[var(--nb-border)] [box-shadow:3px_3px_0px_var(--nb-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:1px_1px_0px_var(--nb-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_0px_var(--nb-shadow)]",
        outline:
          "bg-[var(--nb-surface)] text-[var(--nb-text)] border-2 border-[var(--nb-border)] [box-shadow:3px_3px_0px_var(--nb-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:1px_1px_0px_var(--nb-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_0px_var(--nb-shadow)]",
        secondary:
          "bg-[var(--nb-surface2)] text-[var(--nb-text)] border-2 border-[var(--nb-border)] [box-shadow:3px_3px_0px_var(--nb-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:1px_1px_0px_var(--nb-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_0px_var(--nb-shadow)]",
        ghost:
          "border-2 border-transparent text-[var(--nb-text)] hover:bg-[var(--nb-surface2)] aria-expanded:bg-[var(--nb-surface2)]",
        destructive:
          "bg-[var(--nb-pink)] text-white border-2 border-[var(--nb-border)] [box-shadow:3px_3px_0px_var(--nb-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:[box-shadow:1px_1px_0px_var(--nb-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_0px_var(--nb-shadow)]",
        link: "text-[var(--nb-pink)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
