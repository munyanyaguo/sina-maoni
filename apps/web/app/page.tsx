import { calculateScore, countByImpact, type Impact } from "@sina-maoni/core";
import { ImpactBadge } from "@sina-maoni/ui";

const DEMO_FINDINGS: { impact: Impact }[] = [
  { impact: "critical" },
  { impact: "serious" },
  { impact: "serious" },
  { impact: "minor" },
];

export default function DashboardPage() {
  const score = calculateScore(DEMO_FINDINGS);
  const counts = countByImpact(DEMO_FINDINGS);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Sina Maoni</h1>
      <p className="mt-2 text-slate-600">
        Accessibility scanning and WCAG conformance tracking.
      </p>

      <section aria-labelledby="latest-scan" className="mt-10">
        <h2 id="latest-scan" className="text-xl font-medium">
          Latest scan
        </h2>
        <p className="mt-2 text-5xl font-bold tabular-nums" aria-describedby="score-caption">
          {score}
        </p>
        <p id="score-caption" className="text-slate-600">
          Accessibility score out of 100
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(counts) as Impact[]).map((impact) => (
            <li key={impact}>
              <ImpactBadge impact={impact} count={counts[impact]} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
