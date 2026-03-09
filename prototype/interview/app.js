const state = {
  contextType: "repo",
  isLoading: false
};

const els = {
  typeRepoBtn: document.getElementById("typeRepoBtn"),
  typeSpecBtn: document.getElementById("typeSpecBtn"),
  contextInput: document.getElementById("contextInput"),
  inputHint: document.getElementById("inputHint"),
  loadingHint: document.getElementById("loadingHint"),
  generateBtn: document.getElementById("generateBtn")
};

init();

function init() {
  els.typeRepoBtn?.addEventListener("click", () => setContextType("repo"));
  els.typeSpecBtn?.addEventListener("click", () => setContextType("spec"));
  els.contextInput?.addEventListener("input", () => {
    els.contextInput.classList.remove("input-error");
    updateGenerateState();
  });
  els.generateBtn?.addEventListener("click", navigateToCopilot);

  setContextType("repo");
  updateGenerateState();
}

function setContextType(type) {
  state.contextType = type;
  els.typeRepoBtn?.classList.toggle("active", type === "repo");
  els.typeSpecBtn?.classList.toggle("active", type === "spec");

  if (els.contextInput) {
    els.contextInput.placeholder =
      type === "repo"
        ? "https://github.com/username/repo"
        : "Example: A customer support agent that handles refunds and complaints";
  }

  if (els.inputHint) {
    els.inputHint.textContent =
      type === "repo"
        ? "We'll analyze your codebase and generate relevant test cases and evaluation criteria."
        : "Describe your agent's purpose and we'll generate tailored evaluation scenarios.";
  }

  updateGenerateState();
}

function updateGenerateState() {
  if (!els.generateBtn || !els.contextInput) return;
  const hasInput = Boolean(els.contextInput.value.trim());
  els.generateBtn.disabled = state.isLoading || !hasInput;
}

function navigateToCopilot() {
  if (!els.contextInput || !els.generateBtn) return;
  const rawValue = els.contextInput.value.trim();

  if (!rawValue) {
    els.contextInput.classList.add("input-error");
    els.contextInput.focus();
    return;
  }

  state.isLoading = true;
  updateGenerateState();
  els.generateBtn.textContent =
    state.contextType === "repo" ? "Analyzing repository..." : "Generating evals...";
  els.loadingHint?.classList.remove("hidden");

  window.setTimeout(() => {
    const params = new URLSearchParams({
      contextType: state.contextType,
      context: rawValue
    });
    window.location.href = `./copilot.html?${params.toString()}`;
  }, 2000);
}
