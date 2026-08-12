import { z } from "zod";

export const wcagLevelSchema = z.enum(["A", "AA", "AAA"]);
export const impactSchema = z.enum(["critical", "serious", "moderate", "minor"]);
export const scanSourceSchema = z.enum(["manual", "ci", "extension", "scheduled", "mobile_app"]);
export const scanStatusSchema = z.enum(["queued", "running", "completed", "failed"]);
export const findingStatusSchema = z.enum(["open", "ignored", "waived"]);
export const issueStatusSchema = z.enum([
  "open",
  "in_progress",
  "fixed",
  "verified",
  "wont_fix",
]);

export type WcagLevel = z.infer<typeof wcagLevelSchema>;
export type Impact = z.infer<typeof impactSchema>;
export type ScanSource = z.infer<typeof scanSourceSchema>;
export type ScanStatus = z.infer<typeof scanStatusSchema>;
export type FindingStatus = z.infer<typeof findingStatusSchema>;
export type IssueStatus = z.infer<typeof issueStatusSchema>;

/** Relative cost of each impact level, used to compute an accessibility score. */
export const IMPACT_WEIGHTS: Record<Impact, number> = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
};

export const LEVELS_INCLUDED: Record<WcagLevel, readonly WcagLevel[]> = {
  A: ["A"],
  AA: ["A", "AA"],
  AAA: ["A", "AA", "AAA"],
};
