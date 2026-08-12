import { chromium, type Browser } from "playwright";
import type { ScannedPage, WcagLevel } from "@sina-maoni/core";

import { analysePage, type AnalyseOptions } from "./analyse";

export interface ScanUrlOptions extends AnalyseOptions {
  wcagLevel?: WcagLevel;
  timeoutMs?: number;
  userAgent?: string;
}

/** Launches a headless browser, scans a single URL, and always tears the browser down. */
export async function scanUrl(url: string, options: ScanUrlOptions = {}): Promise<ScannedPage> {
  const { timeoutMs = 30_000, userAgent, ...analyseOptions } = options;

  let browser: Browser | undefined;
  const startedAt = Date.now();

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(userAgent ? { userAgent } : {});
    const page = await context.newPage();

    const response = await page.goto(url, { waitUntil: "load", timeout: timeoutMs });
    const result = await analysePage(page, analyseOptions);

    return {
      ...result,
      statusCode: response?.status(),
      durationMs: Date.now() - startedAt,
    };
  } finally {
    await browser?.close();
  }
}
