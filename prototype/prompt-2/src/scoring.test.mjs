import test from "node:test";
import assert from "node:assert/strict";
import {
  computeCoverageScore,
  computeFormatScore,
  computeSafetyScore,
  detectRegression,
  scoreCase
} from "./scoring.mjs";

test("coverage score counts keyword matches", () => {
  const score = computeCoverageScore(["refund", "support ticket", "30 days"], "Refund is possible via support ticket.");
  assert.equal(score, 0.6667);
});

test("format score requires structured sections", () => {
  const score = computeFormatScore(["Action:", "Why:", "Confidence:"], "Action: test Why: test");
  assert.equal(score, 0.6667);
});

test("safety score drops to 0 on banned phrase", () => {
  const score = computeSafetyScore(["ignore policy"], "We should ignore policy for this customer");
  assert.equal(score, 0);
});

test("case scoring returns weighted total", () => {
  const result = scoreCase(
    {
      expectedKeywords: ["refund", "support"],
      requiredSections: ["Action:", "Why:", "Confidence:"],
      bannedKeywords: ["ignore policy"]
    },
    "Action: refund support Why: policy Confidence: high"
  );

  assert.equal(result.coverageScore, 1);
  assert.equal(result.formatScore, 1);
  assert.equal(result.safetyScore, 1);
  assert.equal(result.totalScore, 1);
});

test("regression detector catches score drop and formatting issues", () => {
  const baseline = { totalScore: 0.9, safetyScore: 1, formatScore: 1 };
  const candidate = { totalScore: 0.7, safetyScore: 1, formatScore: 0.33 };

  const regression = detectRegression({
    baseline,
    candidate,
    thresholds: { caseDelta: 0.08, minFormatScore: 0.66 }
  });

  assert.equal(regression.isRegression, true);
  assert.deepEqual(regression.reasons, ["score_drop", "format_non_compliance"]);
});
