"use client";

import type { ReactNode } from "react";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatusPillProps {
  status: "operational" | "warning" | "critical" | "syncing" | "offline";
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const config = {
    operational: {
      icon: CheckCircle2,
      classes: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
    },
    warning: {
      icon: AlertCircle,
      classes: "border-amber-400/20 bg-amber-400/10 text-amber-400",
    },
    critical: {
      icon: AlertCircle,
      classes: "border-red-400/20 bg-red-400/10 text-red-400",
    },
    syncing: {
      icon: Activity,
      classes: "border-indigo-400/20 bg-indigo-400/10 text-indigo-400",
    },
    offline: {
      icon: Clock,
      classes: "border-white/10 bg-white/5 text-white/40",
    },
  } as const;

  const { icon: Icon, classes } = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 font-mono text-[11px] tracking-wide",
        classes,
        className,
      )}
    >
      <Icon size={12} className={status === "syncing" ? "animate-pulse" : ""} />
      <span className="capitalize">{label || status}</span>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "outline" | "filled" | "tinted";
  color?: "zinc" | "indigo" | "purple" | "emerald";
  className?: string;
}

export function Badge({
  children,
  variant = "tinted",
  color = "zinc",
  className,
}: BadgeProps) {
  const variants = {
    outline: "border border-white/10 text-white/50",
    filled: "bg-white/10 text-white",
    tinted: {
      zinc: "border border-white/10 bg-white/5 text-white/50",
      indigo: "border border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
      purple: "border border-purple-500/20 bg-purple-500/10 text-purple-400",
      emerald:
        "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    }[color],
  } as const;

  return (
    <span
      className={cn(
        "inline-flex rounded-[4px] px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        variant === "tinted" ? variants.tinted : variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
