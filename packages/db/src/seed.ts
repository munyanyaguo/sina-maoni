import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { createSingleConnection } from "./client";
import {
  findings,
  organizationMembers,
  organizations,
  projects,
  rules,
  scanPages,
  scans,
  users,
  type NewRule,
} from "./schema";

// Fixed IDs keep the seed idempotent and let tests and docs reference known rows.
const SEED_ORG_ID = "00000000-0000-4000-8000-00000000a001";
const SEED_USER_ID = "00000000-0000-4000-8000-00000000b001";
const SEED_PROJECT_ID = "00000000-0000-4000-8000-00000000c001";
const SEED_SCAN_ID = "00000000-0000-4000-8000-00000000d001";
const SEED_PAGE_ID = "00000000-0000-4000-8000-00000000e001";
const SEED_PAGE_URL = "https://example.com";

const SEED_RULES: NewRule[] = [
  {
    id: "color-contrast",
    description: "Ensures the contrast between foreground and background colors meets ratios",
    help: "Elements must meet minimum color contrast ratio thresholds",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.9/color-contrast",
    defaultImpact: "serious",
    wcagLevel: "AA",
    wcagCriteria: ["1.4.3"],
    tags: ["wcag2aa", "cat.color"],
  },
  {
    id: "image-alt",
    description: "Ensures <img> elements have alternate text or a role of none or presentation",
    help: "Images must have alternate text",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.9/image-alt",
    defaultImpact: "critical",
    wcagLevel: "A",
    wcagCriteria: ["1.1.1"],
    tags: ["wcag2a", "cat.text-alternatives"],
  },
  {
    id: "label",
    description: "Ensures every form element has a label",
    help: "Form elements must have labels",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.9/label",
    defaultImpact: "critical",
    wcagLevel: "A",
    wcagCriteria: ["1.3.1", "4.1.2"],
    tags: ["wcag2a", "cat.forms"],
  },
  {
    id: "link-name",
    description: "Ensures links have discernible text",
    help: "Links must have discernible text",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.9/link-name",
    defaultImpact: "serious",
    wcagLevel: "A",
    wcagCriteria: ["2.4.4", "4.1.2"],
    tags: ["wcag2a", "cat.name-role-value"],
  },
];

function fingerprint(ruleId: string, selector: string, url: string): string {
  return createHash("sha256").update(`${ruleId}|${selector}|${url}`).digest("hex").slice(0, 32);
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed: NODE_ENV is production. This script deletes rows.");
  }

  const { client, db } = createSingleConnection();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(rules).values(SEED_RULES).onConflictDoNothing();

      // Deleting the org cascades to its projects, scans, pages and findings.
      await tx.delete(organizations).where(eq(organizations.id, SEED_ORG_ID));
      await tx.delete(users).where(eq(users.id, SEED_USER_ID));

      await tx.insert(organizations).values({
        id: SEED_ORG_ID,
        name: "Sina Maoni Demo",
        slug: "demo",
        plan: "pro",
      });

      await tx.insert(users).values({
        id: SEED_USER_ID,
        email: "founder@sina-maoni.test",
        name: "Demo Founder",
      });

      await tx.insert(organizationMembers).values({
        organizationId: SEED_ORG_ID,
        userId: SEED_USER_ID,
        role: "owner",
      });

      await tx.insert(projects).values({
        id: SEED_PROJECT_ID,
        organizationId: SEED_ORG_ID,
        name: "Marketing Site",
        slug: "marketing-site",
        defaultUrl: SEED_PAGE_URL,
        targetWcagLevel: "AA",
      });

      await tx.insert(scans).values({
        id: SEED_SCAN_ID,
        projectId: SEED_PROJECT_ID,
        triggeredById: SEED_USER_ID,
        rootUrl: SEED_PAGE_URL,
        source: "manual",
        status: "completed",
        wcagLevel: "AA",
        startedAt: new Date(),
        finishedAt: new Date(),
      });

      await tx.insert(scanPages).values({
        id: SEED_PAGE_ID,
        scanId: SEED_SCAN_ID,
        url: SEED_PAGE_URL,
        title: "Example Domain",
        statusCode: 200,
        durationMs: 842,
      });

      await tx.insert(findings).values([
        {
          scanId: SEED_SCAN_ID,
          scanPageId: SEED_PAGE_ID,
          ruleId: "color-contrast",
          impact: "serious",
          selector: "main > p:nth-child(2)",
          html: "<p>Body copy with insufficient contrast</p>",
          failureSummary: "Element has insufficient color contrast of 2.8:1 (expected 4.5:1)",
          fingerprint: fingerprint("color-contrast", "main > p:nth-child(2)", SEED_PAGE_URL),
        },
        {
          scanId: SEED_SCAN_ID,
          scanPageId: SEED_PAGE_ID,
          ruleId: "image-alt",
          impact: "critical",
          selector: "header img",
          html: '<img src="/logo.png">',
          failureSummary: "Element does not have an alt attribute",
          fingerprint: fingerprint("image-alt", "header img", SEED_PAGE_URL),
        },
      ]);
    });

    process.stdout.write(`Seeded org=${SEED_ORG_ID} project=${SEED_PROJECT_ID}\n`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  process.exitCode = 1;
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
});
