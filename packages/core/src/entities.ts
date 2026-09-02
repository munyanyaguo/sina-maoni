import { z } from "zod";

import {
  auditResultSchema,
  auditStatusSchema,
  conformanceLevelSchema,
  orgRoleSchema,
  planSchema,
  projectRoleSchema,
} from "./enums";
import {
  findingStatusSchema,
  impactSchema,
  issueStatusSchema,
  scanSourceSchema,
  scanStatusSchema,
  wcagLevelSchema,
} from "./wcag";

// These are API contracts, not row mirrors. Timestamps cross the wire as ISO
// strings, and secret columns (users.password_hash, api_keys.hashed_key) are
// deliberately absent so they cannot be serialised into a response.

const uuid = z.string().uuid();
const isoDateTime = z.string().datetime({ offset: true });
const timestamps = { createdAt: isoDateTime, updatedAt: isoDateTime };

export const organizationSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: planSchema,
  ...timestamps,
});

export const userSchema = z.object({
  id: uuid,
  email: z.string().email(),
  name: z.string().nullable(),
  emailVerifiedAt: isoDateTime.nullable(),
  ...timestamps,
});

export const organizationMemberSchema = z.object({
  organizationId: uuid,
  userId: uuid,
  role: orgRoleSchema,
  ...timestamps,
});

export const projectSchema = z.object({
  id: uuid,
  organizationId: uuid,
  name: z.string().min(1),
  slug: z.string().min(1),
  defaultUrl: z.string().url().nullable(),
  targetWcagLevel: wcagLevelSchema,
  archivedAt: isoDateTime.nullable(),
  ...timestamps,
});

export const projectMemberSchema = z.object({
  projectId: uuid,
  userId: uuid,
  role: projectRoleSchema,
  ...timestamps,
});

export const apiKeySchema = z.object({
  id: uuid,
  organizationId: uuid,
  name: z.string().min(1),
  prefix: z.string().min(1),
  lastUsedAt: isoDateTime.nullable(),
  revokedAt: isoDateTime.nullable(),
  ...timestamps,
});

export const ruleSchema = z.object({
  id: z.string().min(1),
  engine: z.string().min(1),
  description: z.string(),
  help: z.string(),
  helpUrl: z.string().url().nullable(),
  defaultImpact: impactSchema,
  wcagLevel: wcagLevelSchema.nullable(),
  wcagCriteria: z.array(z.string()),
  tags: z.array(z.string()),
  ...timestamps,
});

export const scanSchema = z.object({
  id: uuid,
  projectId: uuid,
  triggeredById: uuid.nullable(),
  rootUrl: z.string().url(),
  source: scanSourceSchema,
  status: scanStatusSchema,
  wcagLevel: wcagLevelSchema,
  commitSha: z.string().nullable(),
  branch: z.string().nullable(),
  pullRequestUrl: z.string().url().nullable(),
  startedAt: isoDateTime.nullable(),
  finishedAt: isoDateTime.nullable(),
  errorMessage: z.string().nullable(),
  ...timestamps,
});

export const scanPageSchema = z.object({
  id: uuid,
  scanId: uuid,
  url: z.string().url(),
  title: z.string().nullable(),
  statusCode: z.number().int().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  ...timestamps,
});

export const findingSchema = z.object({
  id: uuid,
  scanId: uuid,
  scanPageId: uuid.nullable(),
  ruleId: z.string().min(1),
  impact: impactSchema,
  status: findingStatusSchema,
  selector: z.string().min(1),
  html: z.string().nullable(),
  failureSummary: z.string().nullable(),
  fingerprint: z.string().min(1),
  metadata: z.record(z.unknown()).nullable(),
  ...timestamps,
});

export const issueSchema = z.object({
  id: uuid,
  projectId: uuid,
  ruleId: z.string().nullable(),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: issueStatusSchema,
  impact: impactSchema,
  assigneeId: uuid.nullable(),
  externalUrl: z.string().url().nullable(),
  dueAt: isoDateTime.nullable(),
  resolvedAt: isoDateTime.nullable(),
  ...timestamps,
});

export const issueFindingSchema = z.object({
  issueId: uuid,
  findingId: uuid,
});

export const auditSchema = z.object({
  id: uuid,
  projectId: uuid,
  auditorId: uuid.nullable(),
  name: z.string().min(1),
  status: auditStatusSchema,
  wcagLevel: wcagLevelSchema,
  startedAt: isoDateTime.nullable(),
  completedAt: isoDateTime.nullable(),
  ...timestamps,
});

export const auditItemSchema = z.object({
  id: uuid,
  auditId: uuid,
  criterion: z.string().min(1),
  level: wcagLevelSchema,
  result: auditResultSchema.nullable(),
  conformance: conformanceLevelSchema.nullable(),
  notes: z.string().nullable(),
  isManual: z.boolean(),
  ...timestamps,
});

export type Organization = z.infer<typeof organizationSchema>;
export type User = z.infer<typeof userSchema>;
export type OrganizationMember = z.infer<typeof organizationMemberSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type Scan = z.infer<typeof scanSchema>;
export type ScanPage = z.infer<typeof scanPageSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type IssueFinding = z.infer<typeof issueFindingSchema>;
export type Audit = z.infer<typeof auditSchema>;
export type AuditItem = z.infer<typeof auditItemSchema>;
