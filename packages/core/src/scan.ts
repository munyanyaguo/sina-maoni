import { z } from "zod";

import { impactSchema, scanSourceSchema, scanStatusSchema, wcagLevelSchema } from "./wcag";

export const findingSchema = z.object({
  ruleId: z.string().min(1),
  impact: impactSchema,
  selector: z.string().min(1),
  html: z.string().optional(),
  failureSummary: z.string().optional(),
  wcagCriteria: z.array(z.string()).default([]),
  helpUrl: z.string().url().optional(),
});

export const scannedPageSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  statusCode: z.number().int().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  findings: z.array(findingSchema).default([]),
});

export const createScanRequestSchema = z.object({
  projectId: z.string().uuid(),
  rootUrl: z.string().url(),
  source: scanSourceSchema.default("manual"),
  wcagLevel: wcagLevelSchema.default("AA"),
  maxPages: z.number().int().min(1).max(500).default(1),
  commitSha: z.string().optional(),
  branch: z.string().optional(),
  pullRequestUrl: z.string().url().optional(),
});

export const scanResultSchema = z.object({
  scanId: z.string().uuid(),
  status: scanStatusSchema,
  pages: z.array(scannedPageSchema).default([]),
  startedAt: z.coerce.date().optional(),
  finishedAt: z.coerce.date().optional(),
  errorMessage: z.string().optional(),
});

export type ScanFinding = z.infer<typeof findingSchema>;
export type ScannedPage = z.infer<typeof scannedPageSchema>;
export type CreateScanRequest = z.infer<typeof createScanRequestSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
