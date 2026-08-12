import { createHash, randomUUID } from "node:crypto";

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
  const { client, db } = createSingleConnection();

  try {
    await db.insert(rules).values(SEED_RULES).onConflictDoNothing();

    const [org] = await db
      .insert(organizations)
      .values({ name: "Sina Maoni Demo", slug: `demo-${randomUUID().slice(0, 8)}`, plan: "pro" })
      .returning();
    if (!org) throw new Error("Failed to insert organization");

    const [user] = await db
      .insert(users)
      .values({ email: `founder+${randomUUID().slice(0, 8)}@sina-maoni.test`, name: "Demo Founder" })
      .returning();
    if (!user) throw new Error("Failed to insert user");

    await db
      .insert(organizationMembers)
      .values({ organizationId: org.id, userId: user.id, role: "owner" });

    const [project] = await db
      .insert(projects)
      .values({
        organizationId: org.id,
        name: "Marketing Site",
        slug: "marketing-site",
        defaultUrl: "https://example.com",
        targetWcagLevel: "AA",
      })
      .returning();
    if (!project) throw new Error("Failed to insert project");

    const [scan] = await db
      .insert(scans)
      .values({
        projectId: project.id,
        triggeredById: user.id,
        rootUrl: "https://example.com",
        source: "manual",
        status: "completed",
        wcagLevel: "AA",
        startedAt: new Date(),
        finishedAt: new Date(),
      })
      .returning();
    if (!scan) throw new Error("Failed to insert scan");

    const [page] = await db
      .insert(scanPages)
      .values({
        scanId: scan.id,
        url: "https://example.com",
        title: "Example Domain",
        statusCode: 200,
        durationMs: 842,
      })
      .returning();
    if (!page) throw new Error("Failed to insert scan page");

    await db.insert(findings).values([
      {
        scanId: scan.id,
        scanPageId: page.id,
        ruleId: "color-contrast",
        impact: "serious",
        selector: "main > p:nth-child(2)",
        html: "<p>Body copy with insufficient contrast</p>",
        failureSummary: "Element has insufficient color contrast of 2.8:1 (expected 4.5:1)",
        fingerprint: fingerprint("color-contrast", "main > p:nth-child(2)", page.url),
      },
      {
        scanId: scan.id,
        scanPageId: page.id,
        ruleId: "image-alt",
        impact: "critical",
        selector: "header img",
        html: '<img src="/logo.png">',
        failureSummary: "Element does not have an alt attribute",
        fingerprint: fingerprint("image-alt", "header img", page.url),
      },
    ]);

    process.stdout.write(`Seeded org=${org.slug} project=${project.slug} scan=${scan.id}\n`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  process.exitCode = 1;
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
});
