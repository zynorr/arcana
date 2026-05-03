"use client";

import type { ReactNode } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/Panel";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: number;
  helperText?: string;
  icon?: ReactNode;
  accent?: "indigo" | "emerald" | "amber" | "red" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  delta,
  helperText,
  icon,
  accent = "indigo",
  className,
}: StatCardProps) {
  const isPositive = typeof delta === "number" && delta > 0;
  const isNegative = typeof delta === "number" && delta < 0;

  const accentColors = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    purple: "text-purple-400",
  } as const;

  return (
    <Panel className={cn("flex flex-col p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-white/50">{title}</h3>
        {icon ? (
          <div className={cn("opacity-80", accentColors[accent])}>{icon}</div>
        ) : null}
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-4">
        <div className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </div>

        {typeof delta === "number" ? (
          <div
            className={cn(
              "flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium",
              isPositive
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                : isNegative
                  ? "border-red-400/20 bg-red-400/10 text-red-400"
                  : "border-white/10 bg-white/5 text-white/40",
            )}
          >
            {isPositive ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : isNegative ? (
              <TrendingDown size={12} strokeWidth={2.5} />
            ) : (
              <Minus size={12} strokeWidth={2.5} />
            )}
            {Math.abs(delta)}%
          </div>
        ) : null}
      </div>

      {helperText ? (
        <div className="mt-2 text-xs font-medium text-white/30">
          {helperText}
        </div>
      ) : null}
    </Panel>
  );
}
