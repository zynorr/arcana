"use client";

import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: "default" | "elevated" | "subtle";
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, glow = false, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "pro-panel",
      elevated: "pro-panel shadow-glow",
      subtle: "rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          glow && "shadow-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Panel.displayName = "Panel";