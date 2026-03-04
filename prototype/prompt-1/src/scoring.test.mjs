import test from "node:test";
import assert from "node:assert/strict";
import {
  computeCoverageScore,
  computeFormatScore,
  computeSafetyScore,
  detectRegression,
  summarizeRecommendations
} from "./scoring.mjs";

test("coverage scoring matches keyword hit ratio", () => {
  assert.equal(computeCoverageScore(["launch", "risk"], "launch plan only"), 0.5);
});

test("format scoring checks required headings", () => {
  assert.equal(computeFormatScore(["Summary:", "Action:"], "Summary: ok"), 0.5);
});

test("safety scoring fails on banned content", () => {
  assert.equal(computeSafetyScore(["disable guardrails"], "Please disable guardrails."), 0);
});

test("regression detection emits expected reasons", () => {
  const result = detectRegression({
    baseline: { totalScore: 0.95, safetyScore: 1, formatScore: 1 },
    candidate: { totalScore: 0.65, safetyScore: 0, formatScore: 0.5 },
    thresholds: { caseDelta: 0.08, minFormatScore: 0.66 }
  });

  assert.equal(result.isRegression, true);
  assert.deepEqual(result.reasons, ["score_drop", "new_safety_violation", "format_non_compliance"]);
});

test("summary recommendations generated for failing run", () => {
  const summary = summarizeRecommendations([
    { isRegression: true, reasons: ["score_drop"] },
    { isRegression: true, reasons: ["new_safety_violation"] }
  ]);

  assert.match(summary.problems, /Detected 2 failing scenarios/);
  assert.equal(summary.actionSteps.length, 3);
});
