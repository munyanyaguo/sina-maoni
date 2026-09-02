import {
  apiKeySchema,
  auditItemSchema,
  auditSchema,
  findingSchema,
  issueFindingSchema,
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
  issueFindings,
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

// The fourth element lists columns the contract deliberately withholds. A column
// missing from both the contract and that list fails the test, so a new column
// cannot be forgotten and a secret cannot be added to the contract unnoticed.
const CONTRACTS = [
  ["organizations", organizationSchema, organizations, []],
  ["users", userSchema, users, ["passwordHash"]],
  ["organization_members", organizationMemberSchema, organizationMembers, []],
  ["projects", projectSchema, projects, []],
  ["project_members", projectMemberSchema, projectMembers, []],
  ["api_keys", apiKeySchema, apiKeys, ["hashedKey"]],
  ["rules", ruleSchema, rules, []],
  ["scans", scanSchema, scans, []],
  ["scan_pages", scanPageSchema, scanPages, []],
  ["findings", findingSchema, findings, []],
  ["issues", issueSchema, issues, []],
  ["issue_findings", issueFindingSchema, issueFindings, []],
  ["audits", auditSchema, audits, []],
  ["audit_items", auditItemSchema, auditItems, []],
] as const;

describe.each(CONTRACTS)("%s contract", (_table, schema, table, withheld) => {
  it("accounts for every column exactly once", () => {
    expect([...Object.keys(schema.shape), ...withheld].sort()).toEqual(
      Object.keys(getTableColumns(table)).sort(),
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
