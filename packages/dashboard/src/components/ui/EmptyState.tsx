"use client";

import type { ReactNode } from "react";
import { Ghost } from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/Panel";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Panel
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center",
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/20">
        {icon || <Ghost size={32} />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-white/50">{description}</p>
      {action ? <div>{action}</div> : null}
    </Panel>
  );
}
