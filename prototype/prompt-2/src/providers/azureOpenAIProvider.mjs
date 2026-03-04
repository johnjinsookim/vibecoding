const CHAT_COMPLETIONS_API_VERSION = "2024-08-01-preview";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function createAzureOpenAIProvider() {
  const endpoint = requireEnv("AZURE_OPENAI_ENDPOINT").replace(/\/$/, "");
  const apiKey = requireEnv("AZURE_OPENAI_API_KEY");
  const deployment = requireEnv("AZURE_OPENAI_DEPLOYMENT");

  return {
    name: "azure-openai",
    async getResponse(versionKey, testCase) {
      const promptHint =
        versionKey === "baseline"
          ? "Use stable, policy-first support style."
          : "Use the latest candidate style while remaining policy-compliant.";

      const response = await fetch(
        `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${CHAT_COMPLETIONS_API_VERSION}`,
        {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            temperature: 0,
            max_tokens: 300,
            messages: [
              {
                role: "system",
                content:
                  "You are an enterprise customer-support assistant. Always respond with sections: Action:, Why:, Confidence:."
              },
              {
                role: "system",
                content: promptHint
              },
              {
                role: "user",
                content: testCase.input
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Azure OpenAI request failed (${response.status}): ${errorBody}`);
      }

      const payload = await response.json();
      return payload.choices?.[0]?.message?.content?.trim() || "";
    }
  };
}
