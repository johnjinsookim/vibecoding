import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluation } from "./evaluator.mjs";
import { createMockProvider } from "./providers/mockProvider.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");

test("evaluation report includes root cause and run summary", async () => {
  const provider = await createMockProvider(dataDir);
  const report = await runEvaluation({ provider, dataDir });

  assert.equal(typeof report.runId, "string");
  assert.ok(report.rows.length > 0);
  assert.equal(typeof report.rows[0].rootCause, "string");
  assert.ok(Array.isArray(report.rows[0].recommendations));
  assert.equal(typeof report.runSummary.problems, "string");
});

test("hybrid evaluator selection requires all modes", async () => {
  const provider = await createMockProvider(dataDir);

  await assert.rejects(
    () => runEvaluation({
      provider,
      dataDir,
      evaluatorSelection: {
        template: ["policy-template-v1"],
        generated: [],
        custom: ["enterprise-risk-rule-v1"]
      }
    }),
    /Missing modes: generated/
  );
});
