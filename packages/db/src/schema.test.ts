import {
  apiKeySchema,
  auditItemSchema,
  auditSchema,
  findingSchema,
  issueSchema,
  organizationMemberSchema,
  organizationSchema,
  projectMemberSchema,
  projectSchema,
  ruleSchema,
  scanPageSchema,
  scanSchema,
  userSchema,
} from "@sina-maoni/core";
import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  apiKeys,
  auditItems,
  audits,
  findings,
  issues,
  organizationMembers,
  organizations,
  projectMembers,
  projects,
  rules,
  scanPages,
  scans,
  users,
} from "./schema";

const CONTRACTS = [
  ["organizations", organizationSchema, organizations],
  ["users", userSchema, users],
  ["organization_members", organizationMemberSchema, organizationMembers],
  ["projects", projectSchema, projects],
  ["project_members", projectMemberSchema, projectMembers],
  ["api_keys", apiKeySchema, apiKeys],
  ["rules", ruleSchema, rules],
  ["scans", scanSchema, scans],
  ["scan_pages", scanPageSchema, scanPages],
  ["findings", findingSchema, findings],
  ["issues", issueSchema, issues],
  ["audits", auditSchema, audits],
  ["audit_items", auditItemSchema, auditItems],
] as const;

describe.each(CONTRACTS)("%s contract", (_table, schema, table) => {
  it("only exposes fields that exist as columns", () => {
    expect(Object.keys(getTableColumns(table))).toEqual(
      expect.arrayContaining(Object.keys(schema.shape)),
    );
  });
});

// Asserting the column exists as well as being absent from the contract keeps
// these from passing vacuously if the column is ever renamed.
describe("secret columns stay out of the API contract", () => {
  it("userSchema omits passwordHash", () => {
    expect(Object.keys(getTableColumns(users))).toContain("passwordHash");
    expect(Object.keys(userSchema.shape)).not.toContain("passwordHash");
  });

  it("apiKeySchema omits hashedKey", () => {
    expect(Object.keys(getTableColumns(apiKeys))).toContain("hashedKey");
    expect(Object.keys(apiKeySchema.shape)).not.toContain("hashedKey");
  });
});
