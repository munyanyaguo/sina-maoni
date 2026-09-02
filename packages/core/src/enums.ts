import { z } from "zod";

// Exported as const tuples so both z.enum and drizzle's pgEnum can consume them.
// Order is significant: it defines the Postgres enum ordering.
export const PLANS = ["free", "pro", "enterprise"] as const;
export const ORG_ROLES = ["owner", "admin", "member", "viewer"] as const;
export const PROJECT_ROLES = ["owner", "admin", "member", "viewer"] as const;
export const AUDIT_STATUSES = ["pending", "in_progress", "completed"] as const;
export const AUDIT_RESULTS = ["pass", "fail", "na"] as const;
export const CONFORMANCE_LEVELS = [
  "supports",
  "partially_supports",
  "does_not_support",
  "not_applicable",
] as const;

export const planSchema = z.enum(PLANS);
export const orgRoleSchema = z.enum(ORG_ROLES);
export const projectRoleSchema = z.enum(PROJECT_ROLES);
export const auditStatusSchema = z.enum(AUDIT_STATUSES);
export const auditResultSchema = z.enum(AUDIT_RESULTS);
export const conformanceLevelSchema = z.enum(CONFORMANCE_LEVELS);

export type Plan = z.infer<typeof planSchema>;
export type OrgRole = z.infer<typeof orgRoleSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type AuditStatus = z.infer<typeof auditStatusSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
export type ConformanceLevel = z.infer<typeof conformanceLevelSchema>;
