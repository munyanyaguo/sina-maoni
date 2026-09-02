import { z } from "zod";

export const planSchema = z.enum(["free", "pro", "enterprise"]);
export const orgRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export const projectRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export const auditStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export const auditResultSchema = z.enum(["pass", "fail", "na"]);
export const conformanceLevelSchema = z.enum([
  "supports",
  "partially_supports",
  "does_not_support",
  "not_applicable",
]);

export type Plan = z.infer<typeof planSchema>;
export type OrgRole = z.infer<typeof orgRoleSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type AuditStatus = z.infer<typeof auditStatusSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
export type ConformanceLevel = z.infer<typeof conformanceLevelSchema>;
