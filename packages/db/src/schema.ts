import { pgTable, pgEnum, uuid, text, timestamp, boolean, integer, primarykey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMERATIONS

export const planEnum = pgEnum("plan", ["free", "pro", "enterprise"]);
export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "member", "viewer",]);
export const projectRoleEnum = pgEnum("project_role", ["owner", "admin", "member", "viewer",]);
export const wcagLevelEnum = pgEnum("wcag_level", ["A", "AA", "AAA"]);
export const scanSourceEnum = pgEnum("scan_source", ["manual", "ci", "extension", "scheduled", "mobile_app",]);
export const scanStatusEnum = pgEnum("scan_status", ["queued", "running", "completed", "failed",]);
export const impactEnum = pgEnum("impact", ["critical", "serious", "moderate", "minor",]);
export const findingStatusEnum = pgEnum("finding_status", ["open", "ignored", "waived",]);
export const issueStatusEnum = pgEnum("issue_status", ["open", "in_progress", "fixed", "verified", "wont_fix"]);
export const auditStatusEnum = pgEnum("audit_status", ["pending", "in_progress", "completed",]);
export const auditResultEnum = pgEnum("audit_result", ["pass", "fail", "na"]);
export const conformanceLevelEnum = pgEnum("conformance_level", ["supports", "partially_supports", "does_not_support", "not_applicable",]);

// ORGANIZATIONS