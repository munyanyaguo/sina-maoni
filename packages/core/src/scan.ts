import { z } from "zod";

import { impactSchema, scanSourceSchema, scanStatusSchema, wcagLevelSchema } from "./wcag";

// Wire contracts for the scanning engine. These are the shapes a scanner
// produces, before anything is persisted; the stored rows live in entities.ts.

export const scanFindingSchema = z.object({
  ruleId: z.string().min(1),
  impact: impactSchema,
  selector: z.string().min(1),
  html: z.string().optional(),
  failureSummary: z.string().optional(),
  wcagCriteria: z.array(z.string()).default([]),
  helpUrl: z.url().optional(),
});

export const scanResultPageSchema = z.object({
  url: z.url(),
  title: z.string().optional(),
  statusCode: z.number().int().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  findings: z.array(scanFindingSchema).default([]),
});

export const createScanRequestSchema = z.object({
  projectId: z.uuid(),
  rootUrl: z.url(),
  source: scanSourceSchema.default("manual"),
  wcagLevel: wcagLevelSchema.default("AA"),
  maxPages: z.number().int().min(1).max(500).default(1),
  commitSha: z.string().optional(),
  branch: z.string().optional(),
  pullRequestUrl: z.url().optional(),
});

export const scanResultSchema = z.object({
  scanId: z.uuid(),
  status: scanStatusSchema,
  pages: z.array(scanResultPageSchema).default([]),
  startedAt: z.coerce.date().optional(),
  finishedAt: z.coerce.date().optional(),
  errorMessage: z.string().optional(),
});

export type ScanFinding = z.infer<typeof scanFindingSchema>;
export type ScanResultPage = z.infer<typeof scanResultPageSchema>;
export type CreateScanRequest = z.infer<typeof createScanRequestSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
