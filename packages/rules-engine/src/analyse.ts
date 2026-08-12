import AxeBuilder from "@axe-core/playwright";
import type { Page } from "playwright";
import { LEVELS_INCLUDED, type ScannedPage, type WcagLevel } from "@sina-maoni/core";

import { mapViolations, type AxeViolationLike } from "./map-results";

const LEVEL_TAGS: Record<WcagLevel, string> = {
  A: "wcag2a",
  AA: "wcag2aa",
  AAA: "wcag2aaa",
};

export interface AnalyseOptions {
  wcagLevel?: WcagLevel;
  /** axe rule ids to skip, e.g. known false positives for this project. */
  disableRules?: readonly string[];
}

export function tagsForLevel(level: WcagLevel): string[] {
  return LEVELS_INCLUDED[level].map((included) => LEVEL_TAGS[included]);
}

/** Runs axe-core inside an already-navigated Playwright page. */
export async function analysePage(
  page: Page,
  options: AnalyseOptions = {},
): Promise<Omit<ScannedPage, "durationMs" | "statusCode">> {
  const { wcagLevel = "AA", disableRules = [] } = options;

  let builder = new AxeBuilder({ page }).withTags(tagsForLevel(wcagLevel));
  if (disableRules.length > 0) {
    builder = builder.disableRules([...disableRules]);
  }

  const results = await builder.analyze();

  return {
    url: page.url(),
    title: await page.title(),
    findings: mapViolations(results.violations as unknown as AxeViolationLike[]),
  };
}
