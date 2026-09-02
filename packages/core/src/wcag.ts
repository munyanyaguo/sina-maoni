import { z } from "zod";

// Exported as const tuples so both z.enum and drizzle's pgEnum can consume them.
// Order is significant: it defines the Postgres enum ordering.
export const WCAG_LEVELS = ["A", "AA", "AAA"] as const;
export const IMPACTS = ["critical", "serious", "moderate", "minor"] as const;
export const SCAN_SOURCES = ["manual", "ci", "extension", "scheduled", "mobile_app"] as const;
export const SCAN_STATUSES = ["queued", "running", "completed", "failed"] as const;
export const FINDING_STATUSES = ["open", "ignored", "waived"] as const;
export const ISSUE_STATUSES = ["open", "in_progress", "fixed", "verified", "wont_fix"] as const;

export const wcagLevelSchema = z.enum(WCAG_LEVELS);
export const impactSchema = z.enum(IMPACTS);
export const scanSourceSchema = z.enum(SCAN_SOURCES);
export const scanStatusSchema = z.enum(SCAN_STATUSES);
export const findingStatusSchema = z.enum(FINDING_STATUSES);
export const issueStatusSchema = z.enum(ISSUE_STATUSES);

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
