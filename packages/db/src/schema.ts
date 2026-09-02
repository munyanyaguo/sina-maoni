import {
  AUDIT_RESULTS,
  AUDIT_STATUSES,
  CONFORMANCE_LEVELS,
  FINDING_STATUSES,
  IMPACTS,
  ISSUE_STATUSES,
  ORG_ROLES,
  PLANS,
  PROJECT_ROLES,
  SCAN_SOURCES,
  SCAN_STATUSES,
  WCAG_LEVELS,
} from "@sina-maoni/core";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ENUMERATIONS
// Values come from @sina-maoni/core so the wire contract and the database cannot
// drift. Reordering any of these rewrites the Postgres enum.

export const planEnum = pgEnum("plan", PLANS);
export const orgRoleEnum = pgEnum("org_role", ORG_ROLES);
export const projectRoleEnum = pgEnum("project_role", PROJECT_ROLES);
export const wcagLevelEnum = pgEnum("wcag_level", WCAG_LEVELS);
export const scanSourceEnum = pgEnum("scan_source", SCAN_SOURCES);
export const scanStatusEnum = pgEnum("scan_status", SCAN_STATUSES);
export const impactEnum = pgEnum("impact", IMPACTS);
export const findingStatusEnum = pgEnum("finding_status", FINDING_STATUSES);
export const issueStatusEnum = pgEnum("issue_status", ISSUE_STATUSES);
export const auditStatusEnum = pgEnum("audit_status", AUDIT_STATUSES);
export const auditResultEnum = pgEnum("audit_result", AUDIT_RESULTS);
export const conformanceLevelEnum = pgEnum("conformance_level", CONFORMANCE_LEVELS);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

// ORGANIZATIONS

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: planEnum("plan").notNull().default("free"),
    ...timestamps,
  },
  (t) => [uniqueIndex("organizations_slug_idx").on(t.slug)],
);

// USERS

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").notNull().default("member"),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.userId] }),
    index("organization_members_user_idx").on(t.userId),
  ],
);

// PROJECTS

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    defaultUrl: text("default_url"),
    targetWcagLevel: wcagLevelEnum("target_wcag_level").notNull().default("AA"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("projects_org_slug_idx").on(t.organizationId, t.slug)],
);

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: projectRoleEnum("role").notNull().default("member"),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.userId] }),
    index("project_members_user_idx").on(t.userId),
  ],
);

// API KEYS

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hashedKey: text("hashed_key").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("api_keys_prefix_idx").on(t.prefix),
    index("api_keys_org_idx").on(t.organizationId),
  ],
);

// RULE CATALOG

export const rules = pgTable(
  "rules",
  {
    id: text("id").primaryKey(),
    engine: text("engine").notNull().default("axe-core"),
    description: text("description").notNull(),
    help: text("help").notNull(),
    helpUrl: text("help_url"),
    defaultImpact: impactEnum("default_impact").notNull().default("moderate"),
    wcagLevel: wcagLevelEnum("wcag_level"),
    wcagCriteria: text("wcag_criteria")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ...timestamps,
  },
  (t) => [index("rules_wcag_level_idx").on(t.wcagLevel)],
);

// SCANS

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    triggeredById: uuid("triggered_by_id").references(() => users.id, { onDelete: "set null" }),
    rootUrl: text("root_url").notNull(),
    source: scanSourceEnum("source").notNull().default("manual"),
    status: scanStatusEnum("status").notNull().default("queued"),
    wcagLevel: wcagLevelEnum("wcag_level").notNull().default("AA"),
    commitSha: text("commit_sha"),
    branch: text("branch"),
    pullRequestUrl: text("pull_request_url"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    ...timestamps,
  },
  (t) => [
    index("scans_project_created_idx").on(t.projectId, t.createdAt),
    index("scans_status_idx").on(t.status),
  ],
);

export const scanPages = pgTable(
  "scan_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    statusCode: integer("status_code"),
    durationMs: integer("duration_ms"),
    ...timestamps,
  },
  (t) => [index("scan_pages_scan_idx").on(t.scanId)],
);

// FINDINGS

export const findings = pgTable(
  "findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    scanPageId: uuid("scan_page_id").references(() => scanPages.id, { onDelete: "cascade" }),
    ruleId: text("rule_id")
      .notNull()
      .references(() => rules.id, { onDelete: "restrict" }),
    impact: impactEnum("impact").notNull(),
    status: findingStatusEnum("status").notNull().default("open"),
    selector: text("selector").notNull(),
    html: text("html"),
    failureSummary: text("failure_summary"),
    fingerprint: text("fingerprint").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (t) => [
    index("findings_scan_idx").on(t.scanId),
    index("findings_rule_idx").on(t.ruleId),
    index("findings_fingerprint_idx").on(t.fingerprint),
  ],
);

// ISSUES

export const issues = pgTable(
  "issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    ruleId: text("rule_id").references(() => rules.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    status: issueStatusEnum("status").notNull().default("open"),
    impact: impactEnum("impact").notNull().default("moderate"),
    assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
    externalUrl: text("external_url"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("issues_project_status_idx").on(t.projectId, t.status),
    index("issues_assignee_idx").on(t.assigneeId),
  ],
);

export const issueFindings = pgTable(
  "issue_findings",
  {
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    findingId: uuid("finding_id")
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.findingId] })],
);

// MANUAL AUDITS (VPAT / ACR)

export const audits = pgTable(
  "audits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    auditorId: uuid("auditor_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    status: auditStatusEnum("status").notNull().default("pending"),
    wcagLevel: wcagLevelEnum("wcag_level").notNull().default("AA"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("audits_project_idx").on(t.projectId)],
);

export const auditItems = pgTable(
  "audit_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditId: uuid("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    criterion: text("criterion").notNull(),
    level: wcagLevelEnum("level").notNull(),
    result: auditResultEnum("result"),
    conformance: conformanceLevelEnum("conformance"),
    notes: text("notes"),
    isManual: boolean("is_manual").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("audit_items_audit_criterion_idx").on(t.auditId, t.criterion)],
);

// RELATIONS

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  apiKeys: many(apiKeys),
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
  projectMemberships: many(projectMembers),
  assignedIssues: many(issues),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  members: many(projectMembers),
  scans: many(scans),
  issues: many(issues),
  audits: many(audits),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.organizationId],
    references: [organizations.id],
  }),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  project: one(projects, { fields: [scans.projectId], references: [projects.id] }),
  triggeredBy: one(users, { fields: [scans.triggeredById], references: [users.id] }),
  pages: many(scanPages),
  findings: many(findings),
}));

export const scanPagesRelations = relations(scanPages, ({ one, many }) => ({
  scan: one(scans, { fields: [scanPages.scanId], references: [scans.id] }),
  findings: many(findings),
}));

export const rulesRelations = relations(rules, ({ many }) => ({
  findings: many(findings),
  issues: many(issues),
}));

export const findingsRelations = relations(findings, ({ one, many }) => ({
  scan: one(scans, { fields: [findings.scanId], references: [scans.id] }),
  page: one(scanPages, { fields: [findings.scanPageId], references: [scanPages.id] }),
  rule: one(rules, { fields: [findings.ruleId], references: [rules.id] }),
  issueLinks: many(issueFindings),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, { fields: [issues.projectId], references: [projects.id] }),
  rule: one(rules, { fields: [issues.ruleId], references: [rules.id] }),
  assignee: one(users, { fields: [issues.assigneeId], references: [users.id] }),
  findingLinks: many(issueFindings),
}));

export const issueFindingsRelations = relations(issueFindings, ({ one }) => ({
  issue: one(issues, { fields: [issueFindings.issueId], references: [issues.id] }),
  finding: one(findings, { fields: [issueFindings.findingId], references: [findings.id] }),
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  project: one(projects, { fields: [audits.projectId], references: [projects.id] }),
  auditor: one(users, { fields: [audits.auditorId], references: [users.id] }),
  items: many(auditItems),
}));

export const auditItemsRelations = relations(auditItems, ({ one }) => ({
  audit: one(audits, { fields: [auditItems.auditId], references: [audits.id] }),
}));

// INFERRED TYPES

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
export type ScanPage = typeof scanPages.$inferSelect;
export type NewScanPage = typeof scanPages.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
export type AuditItem = typeof auditItems.$inferSelect;
export type NewAuditItem = typeof auditItems.$inferInsert;
