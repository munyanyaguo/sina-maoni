import type { Impact } from "@sina-maoni/core";

import { cn } from "./cn";
import { VisuallyHidden } from "./visually-hidden";

const IMPACT_STYLES: Record<Impact, string> = {
  critical: "bg-red-100 text-red-900 ring-red-600/30",
  serious: "bg-orange-100 text-orange-900 ring-orange-600/30",
  moderate: "bg-amber-100 text-amber-900 ring-amber-600/30",
  minor: "bg-slate-100 text-slate-900 ring-slate-600/30",
};

export interface ImpactBadgeProps {
  impact: Impact;
  count?: number;
  className?: string;
}

export function ImpactBadge({ impact, count, className }: ImpactBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset",
        IMPACT_STYLES[impact],
        className,
      )}
    >
      <span aria-hidden="true">{impact}</span>
      <VisuallyHidden>{`${impact} impact`}</VisuallyHidden>
      {count !== undefined ? (
        <>
          <span aria-hidden="true">{count}</span>
          <VisuallyHidden>{`${count} findings`}</VisuallyHidden>
        </>
      ) : null}
    </span>
  );
}
