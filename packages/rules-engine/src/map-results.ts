import type { Impact, ScanFinding } from "@sina-maoni/core";

const AXE_IMPACTS: readonly Impact[] = ["critical", "serious", "moderate", "minor"];

export function normaliseImpact(impact: string | null | undefined): Impact {
  return AXE_IMPACTS.find((value) => value === impact) ?? "moderate";
}

/** Converts axe tags such as `wcag143` / `wcag2aa` into WCAG success criteria like `1.4.3`. */
export function wcagCriteriaFromTags(tags: readonly string[]): string[] {
  const criteria = new Set<string>();
  for (const tag of tags) {
    const match = /^wcag(\d)(\d)(\d+)$/.exec(tag);
    if (match) {
      const [, principle, guideline, criterion] = match;
      criteria.add(`${principle}.${guideline}.${criterion}`);
    }
  }
  return [...criteria].sort();
}

export interface AxeNodeLike {
  target: readonly (string | readonly string[])[];
  html?: string;
  failureSummary?: string;
}

export interface AxeViolationLike {
  id: string;
  impact?: string | null;
  help?: string;
  helpUrl?: string;
  tags: readonly string[];
  nodes: readonly AxeNodeLike[];
}

function selectorOf(node: AxeNodeLike): string {
  const first = node.target[0];
  if (Array.isArray(first)) return first.join(" ");
  return typeof first === "string" ? first : "unknown";
}

export function mapViolations(violations: readonly AxeViolationLike[]): ScanFinding[] {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      ruleId: violation.id,
      impact: normaliseImpact(violation.impact),
      selector: selectorOf(node),
      html: node.html,
      failureSummary: node.failureSummary,
      wcagCriteria: wcagCriteriaFromTags(violation.tags),
      helpUrl: violation.helpUrl,
    })),
  );
}
