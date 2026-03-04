import path from "node:path";
import { loadJson } from "../io.mjs";

export async function createMockProvider(dataDir) {
  const mockResponses = await loadJson(path.join(dataDir, "mock-responses.json"));

  return {
    name: "mock",
    async getResponse(versionKey, testCase) {
      const byVersion = mockResponses[versionKey] || {};
      const response = byVersion[testCase.id];
      if (!response) {
        throw new Error(`Missing mock response for ${versionKey}/${testCase.id}`);
      }
      return response;
    }
  };
}
