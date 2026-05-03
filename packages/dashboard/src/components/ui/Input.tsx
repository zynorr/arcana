"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm text-white transition-all duration-200 placeholder:text-white/25 hover:bg-white/[0.04] hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/30 focus-visible:border-accent-indigo/50 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 pr-10 text-sm text-white transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/30 focus-visible:border-accent-indigo/50 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "16px",
      }}
      {...props}
    />
  );
});

Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white transition-all duration-200 placeholder:text-white/25 hover:bg-white/[0.04] hover:border-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/30 focus-visible:border-accent-indigo/50 disabled:cursor-not-allowed disabled:opacity-40 resize-none",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";