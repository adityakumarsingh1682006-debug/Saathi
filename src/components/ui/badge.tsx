import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/35 shadow-xs",
        secondary:
          "bg-white text-[#667A78] border border-[#7BAE9D]/25 shadow-2xs",
        success:
          "bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/40 shadow-xs",
        warning:
          "bg-[#C98A28]/12 text-[#C98A28] border border-[#C98A28]/35",
        destructive:
          "bg-[#C93C4B]/12 text-[#C93C4B] border border-[#C93C4B]/35",
        outline:
          "text-[#19302F] border border-[#7BAE9D]/40 bg-white/70",
        glow:
          "bg-[#E6F3EF] text-[#176B67] border border-[#176B67]/35 shadow-[0_0_12px_rgba(23,107,103,0.12)]",
        blockchain:
          "bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/40 shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            variant === "warning" && "bg-[#C98A28]",
            variant === "destructive" && "bg-[#C93C4B]",
            (!variant || variant === "default" || variant === "success" || variant === "blockchain" || variant === "glow") && "bg-[#176B67]"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
