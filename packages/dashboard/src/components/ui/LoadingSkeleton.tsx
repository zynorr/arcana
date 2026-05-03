"use client";

import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/Panel";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/10", className)} />;
}

export function PanelSkeleton() {
  return (
    <Panel className="p-6">
      <div className="mb-4 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="mb-2 h-8 w-32" />
      <Skeleton className="h-3 w-48" />
    </Panel>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="flex h-[400px] flex-col p-6 lg:col-span-2">
          <Skeleton className="mb-6 h-6 w-48" />
          <Skeleton className="flex-1 w-full" />
        </Panel>
        <Panel className="flex h-[400px] flex-col p-6">
          <Skeleton className="mb-6 h-6 w-48" />
          <Skeleton className="flex-1 w-full" />
        </Panel>
      </div>
    </div>
  );
}
