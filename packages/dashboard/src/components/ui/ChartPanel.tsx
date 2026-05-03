"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/Panel";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  subtitle,
  legend,
  action,
  children,
  className,
}: ChartPanelProps) {
  return (
    <Panel className={cn("flex flex-col p-6", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
        </div>
        {legend || action ? (
          <div className="flex items-center gap-4">
            {legend}
            {action}
          </div>
        ) : null}
      </div>
      <div className="min-h-[300px] w-full flex-1">{children}</div>
    </Panel>
  );
}
