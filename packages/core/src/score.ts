import { IMPACT_WEIGHTS, type Impact } from "./wcag";

export interface ScoreInput {
  impact: Impact;
}

/**
 * Accessibility score from 0-100. Weighted violations are damped logarithmically so a
 * page with 200 minor issues does not score identically to one with 20 critical ones.
 */
export function calculateScore(findings: readonly ScoreInput[], elementsChecked = 0): number {
  if (findings.length === 0) return 100;

  const weighted = findings.reduce((total, f) => total + IMPACT_WEIGHTS[f.impact], 0);
  const denominator = Math.max(elementsChecked, findings.length * 10);
  const ratio = weighted / denominator;

  return Math.max(0, Math.round(100 * (1 - Math.min(1, ratio))));
}

export function countByImpact(findings: readonly ScoreInput[]): Record<Impact, number> {
  const counts: Record<Impact, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const finding of findings) counts[finding.impact] += 1;
  return counts;
}

/** CI gate: fails when any finding meets or exceeds the configured severity threshold. */
export function shouldFailBuild(findings: readonly ScoreInput[], threshold: Impact): boolean {
  const order: readonly Impact[] = ["minor", "moderate", "serious", "critical"];
  const min = order.indexOf(threshold);
  return findings.some((f) => order.indexOf(f.impact) >= min);
}
