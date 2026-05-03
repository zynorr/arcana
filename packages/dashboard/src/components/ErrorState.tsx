"use client";

import { AlertCircle } from "lucide-react";
import { Panel } from "@/components/ui/Panel";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Panel className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <p className="mb-4 text-sm text-white/50">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          Try Again
        </button>
      )}
    </Panel>
  );
}
