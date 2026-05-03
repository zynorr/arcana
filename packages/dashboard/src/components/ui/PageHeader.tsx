"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  rangeControls?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  rangeControls,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-[14px] leading-relaxed text-white/45">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions || rangeControls ? (
        <div className="flex items-center gap-4">
          {rangeControls}
          {actions}
        </div>
      ) : null}
    </div>
  );
}