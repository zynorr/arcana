"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/Panel";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  highlight,
}: MetricCardProps) {
  const trendTone =
    trend === "up"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
      : trend === "down"
        ? "border-red-400/20 bg-red-400/10 text-red-400"
        : "border-white/10 bg-white/5 text-white/40";

  return (
    <Panel
      className={cn(
        "flex flex-col p-5",
        highlight && "border-indigo-500/20 bg-indigo-500/10",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-white/50">{title}</span>
        {icon && <span className="text-white/35">{icon}</span>}
      </div>
      <div className="text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {trend && trendValue && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium",
              trendTone,
            )}
          >
            {trend === "up" ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : trend === "down" ? (
              <TrendingDown size={12} strokeWidth={2.5} />
            ) : (
              <Minus size={12} strokeWidth={2.5} />
            )}
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}
            {trendValue.replace(/^[+-]/, "")}
          </span>
        )}
        {subtitle && <span className="text-xs text-white/30">{subtitle}</span>}
      </div>
    </Panel>
  );
}
