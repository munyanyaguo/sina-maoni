import { describe, expect, it } from "vitest";

import { calculateScore, countByImpact, shouldFailBuild } from "./score";

describe("calculateScore", () => {
  it("returns 100 for a clean page", () => {
    expect(calculateScore([])).toBe(100);
  });

  it("penalises critical findings more than minor ones", () => {
    const critical = calculateScore([{ impact: "critical" }]);
    const minor = calculateScore([{ impact: "minor" }]);
    expect(critical).toBeLessThan(minor);
  });

  it("never drops below zero", () => {
    const findings = Array.from({ length: 50 }, () => ({ impact: "critical" as const }));
    expect(calculateScore(findings, 1)).toBe(0);
  });
});

describe("countByImpact", () => {
  it("tallies each impact level", () => {
    expect(countByImpact([{ impact: "critical" }, { impact: "critical" }, { impact: "minor" }])).toEqual(
      { critical: 2, serious: 0, moderate: 0, minor: 1 },
    );
  });
});

describe("shouldFailBuild", () => {
  it("fails when a finding meets the threshold", () => {
    expect(shouldFailBuild([{ impact: "serious" }], "serious")).toBe(true);
  });

  it("passes when all findings are below the threshold", () => {
    expect(shouldFailBuild([{ impact: "minor" }], "serious")).toBe(false);
  });
});
