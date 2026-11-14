import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#176B67] text-white hover:bg-[#135855] shadow-sm hover:shadow active:bg-[#0f4644]",
        outline:
          "border-[#7BAE9D]/35 bg-white text-[#19302F] hover:bg-[#E6F3EF] hover:text-[#176B67] hover:border-[#176B67]/40 shadow-xs",
        secondary:
          "bg-[#E6F3EF] text-[#176B67] hover:bg-[#d8ece6] border border-[#7BAE9D]/30 font-semibold shadow-xs",
        ghost:
          "text-[#19302F] hover:bg-[#E6F3EF] hover:text-[#176B67]",
        destructive:
          "bg-[#C93C4B] text-white hover:bg-[#b03440] shadow-sm",
        warning:
          "bg-[#C98A28] text-white hover:bg-[#b27920] shadow-sm",
        link: "text-[#176B67] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-xl px-5 text-sm font-semibold [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-xl [&_svg:not([class*='size-'])]:size-5",
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
