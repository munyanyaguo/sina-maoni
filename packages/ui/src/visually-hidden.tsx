import type { ReactNode } from "react";

/** Content available to screen readers but visually hidden. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
