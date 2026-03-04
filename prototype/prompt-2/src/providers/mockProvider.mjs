import path from "node:path";
import { loadJson } from "../io.mjs";

export async function createMockProvider(dataDir) {
  const responsesPath = path.join(dataDir, "mock-responses.json");
  const mockResponses = await loadJson(responsesPath);

  return {
    name: "mock",
    async getResponse(versionKey, testCase) {
      const byVersion = mockResponses[versionKey] || {};
      const response = byVersion[testCase.id];
      if (!response) {
        throw new Error(`Missing mock response for version=${versionKey}, case=${testCase.id}`);
      }
      return response;
    }
  };
}
