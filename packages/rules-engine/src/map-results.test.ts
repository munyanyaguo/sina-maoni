import { describe, expect, it } from "vitest";

import { mapViolations, normaliseImpact, wcagCriteriaFromTags } from "./map-results";

describe("normaliseImpact", () => {
  it("passes through known axe impacts", () => {
    expect(normaliseImpact("critical")).toBe("critical");
  });

  it("falls back to moderate for null or unknown impacts", () => {
    expect(normaliseImpact(null)).toBe("moderate");
    expect(normaliseImpact("catastrophic")).toBe("moderate");
  });
});

describe("wcagCriteriaFromTags", () => {
  it("expands numeric wcag tags into success criteria", () => {
    expect(wcagCriteriaFromTags(["wcag2aa", "wcag143", "cat.color"])).toEqual(["1.4.3"]);
  });

  it("handles multi-digit criteria", () => {
    expect(wcagCriteriaFromTags(["wcag1410"])).toEqual(["1.4.10"]);
  });
});

describe("mapViolations", () => {
  it("flattens one finding per affected node", () => {
    const findings = mapViolations([
      {
        id: "image-alt",
        impact: "critical",
        helpUrl: "https://example.com/image-alt",
        tags: ["wcag2a", "wcag111"],
        nodes: [
          { target: ["header img"], html: "<img>" },
          { target: [["#shadow-host", "img"]] },
        ],
      },
    ]);

    expect(findings).toHaveLength(2);
    expect(findings[0]).toMatchObject({ ruleId: "image-alt", selector: "header img" });
    expect(findings[1]?.selector).toBe("#shadow-host img");
    expect(findings[0]?.wcagCriteria).toEqual(["1.1.1"]);
  });
});
