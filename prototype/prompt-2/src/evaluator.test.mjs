import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluation } from "./evaluator.mjs";
import { createMockProvider } from "./providers/mockProvider.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");

test("runEvaluation returns fail when regressions exist", async () => {
  const provider = await createMockProvider(dataDir);

  const report = await runEvaluation({
    provider,
    dataDir,
    thresholds: { caseDelta: 0.08, meanDelta: 0.03, minFormatScore: 0.66 }
  });

  assert.equal(report.summary.status, "fail");
  assert.equal(report.summary.totalCases, 5);
  assert.ok(report.summary.regressionCount >= 1);

  const hasRegression = report.rows.some((row) => row.isRegression);
  assert.equal(hasRegression, true);
});
