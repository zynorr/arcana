"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DataTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto pb-4", className)}>
      <table className="w-full border-separate border-spacing-y-1 text-left">
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <thead className={className}>{children}</thead>;
}

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "group transition-all duration-300 ease-out",
        onClick ? "cursor-pointer hover:bg-white/[0.02]" : null,
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
  isHeader = false,
}: {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
}) {
  if (isHeader) {
    return (
      <th
        className={cn(
          "bg-transparent px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/30",
          className,
        )}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={cn(
        "relative border-y border-white/[0.03] bg-white/[0.015] px-5 py-4 text-sm text-white/70 transition-colors first:rounded-l-2xl first:border-l first:border-white/[0.06] last:rounded-r-2xl last:border-r last:border-white/[0.06] group-hover:border-white/[0.08] group-hover:bg-white/[0.03]",
        className,
      )}
    >
      {children}
    </td>
  );
}