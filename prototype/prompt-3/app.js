const SCREENS = ["select", "define", "results", "analyze"];

const STORAGE_KEYS = {
  customEvaluators: "prompt3-custom-evaluators",
  selectedEvaluator: "prompt3-selected-evaluator",
  selectedExperiment: "prompt3-selected-experiment",
  selectedCase: "prompt3-selected-case"
};

let report = null;

const state = {
  activeScreen: "select",
  customEvaluators: [],
  selectedEvaluatorId: null,
  selectedExperimentId: null,
  selectedCaseId: null,
  defineEditingId: null,
  searchQuery: ""
};

async function loadReport() {
  const response = await fetch("./reports/latest-report.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load report (${response.status})`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toPct(value) {
  return `${(value * 100).toFixed(0)}%`;
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function isCustomEvaluator(evaluatorId) {
  return evaluatorId.startsWith("custom-");
}

function hashToUnit(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0) / 4294967295;
}

function syntheticScore(seed, min = 0.6, max = 0.95) {
  return round(min + hashToUnit(seed) * (max - min), 2);
}

function loadCustomEvaluators() {
  const raw = localStorage.getItem(STORAGE_KEYS.customEvaluators);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEYS.customEvaluators);
    return [];
  }
}

function saveCustomEvaluators() {
  localStorage.setItem(STORAGE_KEYS.customEvaluators, JSON.stringify(state.customEvaluators));
}

function saveSelections() {
  if (state.selectedEvaluatorId) {
    localStorage.setItem(STORAGE_KEYS.selectedEvaluator, state.selectedEvaluatorId);
  }
  if (state.selectedExperimentId) {
    localStorage.setItem(STORAGE_KEYS.selectedExperiment, state.selectedExperimentId);
  }
  if (state.selectedCaseId) {
    localStorage.setItem(STORAGE_KEYS.selectedCase, state.selectedCaseId);
  }
}

function getAllEvaluators() {
  return [...report.evaluatorCatalog, ...state.customEvaluators];
}

function getEvaluatorById(evaluatorId) {
  return getAllEvaluators().find((evaluator) => evaluator.id === evaluatorId) || null;
}

function getExperimentById(experimentId) {
  return report.experiments.find((experiment) => experiment.id === experimentId) || null;
}

function getCaseById(experiment, caseId) {
  return experiment.cases.find((item) => item.id === caseId) || null;
}

function getExperimentEvaluation(experiment, evaluatorId) {
  const existing = experiment.evaluations.find((evaluation) => evaluation.evaluatorId === evaluatorId);
  if (existing) {
    return existing;
  }

  const evaluator = getEvaluatorById(evaluatorId);
  const score = syntheticScore(`${experiment.id}:${evaluatorId}:exp`);
  return {
    evaluatorId,
    score,
    status: score >= evaluator.threshold ? "pass" : "fail",
    highlights: ["Generated score for custom evaluator preview."]
  };
}

function getCaseEvaluation(experimentId, caseRow, evaluatorId) {
  const existing = caseRow.evaluatorBreakdown[evaluatorId];
  if (existing) {
    return existing;
  }

  const evaluator = getEvaluatorById(evaluatorId);
  const score = syntheticScore(`${experimentId}:${caseRow.id}:${evaluatorId}:case`, 0.58, 0.97);
  return {
    score,
    status: score >= evaluator.threshold ? "pass" : "fail",
    reasoning: `Synthetic custom evaluator scoring for ${caseRow.id}.`,
    evidence: [
      `Category: ${evaluator.category}`,
      `Threshold: ${evaluator.threshold}`
    ]
  };
}

function scoreTag(score) {
  const quality = score >= 0.8 ? "score-good" : "score-bad";
  return `<span class="score-tag ${quality}">${toPct(score)}</span>`;
}

function getMetricScore(experiment, evaluatorId) {
  return getExperimentEvaluation(experiment, evaluatorId).score;
}

function getConcisenessScore(experiment) {
  return getMetricScore(experiment, "eval-task-success");
}

function getCorrectnessScore(experiment) {
  return getMetricScore(experiment, "eval-groundedness");
}

function getSimplicityScore(experiment) {
  return getMetricScore(experiment, "eval-safety");
}

function getCreatedAt(index) {
  const base = new Date(report.generatedAt);
  base.setDate(base.getDate() - (index + 2));
  return base.toLocaleDateString();
}

function truncate(text, length = 84) {
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length - 3)}...`;
}

function filteredExperiments() {
  if (!state.searchQuery) {
    return report.experiments;
  }
  const lowered = state.searchQuery.toLowerCase();
  return report.experiments.filter((experiment) => experiment.name.toLowerCase().includes(lowered));
}

function ensureValidState() {
  const evaluators = getAllEvaluators();
  if (!evaluators.length) {
    throw new Error("No evaluators available.");
  }

  if (!evaluators.some((evaluator) => evaluator.id === state.selectedEvaluatorId)) {
    state.selectedEvaluatorId = localStorage.getItem(STORAGE_KEYS.selectedEvaluator) || evaluators[0].id;
    if (!evaluators.some((evaluator) => evaluator.id === state.selectedEvaluatorId)) {
      state.selectedEvaluatorId = evaluators[0].id;
    }
  }

  if (!report.experiments.some((experiment) => experiment.id === state.selectedExperimentId)) {
    state.selectedExperimentId = localStorage.getItem(STORAGE_KEYS.selectedExperiment) || report.experiments[0].id;
    if (!report.experiments.some((experiment) => experiment.id === state.selectedExperimentId)) {
      state.selectedExperimentId = report.experiments[0].id;
    }
  }

  const selectedExperiment = getExperimentById(state.selectedExperimentId);
  if (!selectedExperiment.cases.some((caseRow) => caseRow.id === state.selectedCaseId)) {
    state.selectedCaseId = localStorage.getItem(STORAGE_KEYS.selectedCase) || selectedExperiment.cases[0].id;
    if (!selectedExperiment.cases.some((caseRow) => caseRow.id === state.selectedCaseId)) {
      state.selectedCaseId = selectedExperiment.cases[0].id;
    }
  }

  saveSelections();
}

function setScreen(screenId) {
  if (!SCREENS.includes(screenId)) {
    return;
  }
  state.activeScreen = screenId;
  window.location.hash = screenId;
  renderShell();
}

function nextScreen() {
  const index = SCREENS.indexOf(state.activeScreen);
  if (index < SCREENS.length - 1) {
    setScreen(SCREENS[index + 1]);
  }
}

function prevScreen() {
  const index = SCREENS.indexOf(state.activeScreen);
  if (index > 0) {
    setScreen(SCREENS[index - 1]);
  }
}

function renderBars(title, values) {
  return `
    <article class="chart-card">
      <p class="chart-title">${escapeHtml(title)}</p>
      <div class="bars">
        ${values
          .map(
            (value, index) => `
            <div class="bar-wrap">
              <div class="bar" style="height:${Math.max(8, Math.round(value * 96))}px"></div>
              <div class="bar-label">E${index + 1}</div>
            </div>
          `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderShell() {
  document.getElementById("globalMeta").textContent = `Run ${report.runId} | Generated ${new Date(report.generatedAt).toLocaleString()}`;

  document.querySelectorAll(".screen").forEach((screenNode) => {
    screenNode.classList.add("hidden");
  });
  document.getElementById(`screen-${state.activeScreen}`).classList.remove("hidden");

  document.querySelectorAll(".step-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === state.activeScreen);
  });

  const prev = document.getElementById("navPrev");
  const next = document.getElementById("navNext");
  prev.disabled = state.activeScreen === SCREENS[0];
  next.disabled = state.activeScreen === SCREENS[SCREENS.length - 1];

  renderSelectScreen();
  renderDefineScreen();
  renderResultsScreen();
  renderAnalyzeScreen();
}

function renderSelectScreen() {
  const selectedEvaluator = getEvaluatorById(state.selectedEvaluatorId);
  const experiments = filteredExperiments();

  document.getElementById("selectedEvaluatorBadge").textContent = `Evaluator: ${selectedEvaluator.name}`;
  document.getElementById("evaluatorCount").textContent = `${getAllEvaluators().length}`;

  const evaluatorMenu = document.getElementById("evaluatorMenu");
  evaluatorMenu.innerHTML = getAllEvaluators()
    .map((evaluator) => {
      const active = evaluator.id === state.selectedEvaluatorId ? "active" : "";
      const scope = isCustomEvaluator(evaluator.id) ? "Custom" : "Prebuilt";
      return `
        <button class="menu-item ${active}" data-evaluator-id="${escapeHtml(evaluator.id)}">
          <div class="menu-item-title">${escapeHtml(evaluator.name)}</div>
          <div class="menu-item-meta">${escapeHtml(scope)} | ${escapeHtml(evaluator.category)} | Threshold ${evaluator.threshold}</div>
        </button>
      `;
    })
    .join("");

  document.getElementById("selectCharts").innerHTML = [
    renderBars(
      `${selectedEvaluator.name} score`,
      experiments.map((experiment) => getMetricScore(experiment, selectedEvaluator.id))
    ),
    renderBars(
      "Correctness",
      experiments.map((experiment) => getCorrectnessScore(experiment))
    ),
    renderBars(
      "P50 Latency",
      experiments.map((experiment) => Math.min(experiment.summary.avgLatencyMs / 1500, 1))
    )
  ].join("");

  const rows = document.getElementById("selectExperimentRows");
  rows.innerHTML = experiments
    .map((experiment) => {
      const selectedScore = getMetricScore(experiment, selectedEvaluator.id);
      const correctness = getCorrectnessScore(experiment);
      const status = selectedScore >= selectedEvaluator.threshold ? "pass" : "fail";
      const active = experiment.id === state.selectedExperimentId ? "active" : "";
      return `
        <tr class="${active}" data-select-experiment-id="${escapeHtml(experiment.id)}">
          <td>${escapeHtml(experiment.name)}</td>
          <td>${scoreTag(selectedScore)}</td>
          <td>${scoreTag(correctness)}</td>
          <td>${status.toUpperCase()}</td>
        </tr>
      `;
    })
    .join("");
}

function setDefineFormMessage(message, error = false) {
  const node = document.getElementById("defineMessage");
  node.textContent = message;
  node.style.color = error ? "#c54656" : "#63758d";
}

function populateDefineForm(mode = "auto") {
  const selectedEvaluator = getEvaluatorById(state.selectedEvaluatorId);
  let evaluator = null;

  if (mode === "new") {
    evaluator = {
      id: null,
      name: "",
      category: "quality",
      threshold: 0.8,
      rubric: "You are an evaluator. Score the response using clear criteria and return concise reasoning.",
      model: "OpenAI gpt-4.1-mini"
    };
    state.defineEditingId = null;
  } else if (isCustomEvaluator(selectedEvaluator.id)) {
    evaluator = { ...selectedEvaluator, model: selectedEvaluator.model || "OpenAI gpt-4.1-mini" };
    state.defineEditingId = selectedEvaluator.id;
  } else {
    evaluator = {
      id: null,
      name: `${selectedEvaluator.name} Copy`,
      category: selectedEvaluator.category,
      threshold: selectedEvaluator.threshold,
      rubric: selectedEvaluator.rubric,
      model: "OpenAI gpt-4.1-mini"
    };
    state.defineEditingId = null;
  }

  document.getElementById("defineName").value = evaluator.name;
  document.getElementById("defineCategory").value = evaluator.category;
  document.getElementById("defineModel").value = evaluator.model;
  document.getElementById("defineThreshold").value = evaluator.threshold;
  document.getElementById("defineRubric").value = evaluator.rubric;

  document.getElementById("defineModeBadge").textContent = state.defineEditingId ? "Mode: Edit" : "Mode: New";
  document.getElementById("defineDeleteBtn").disabled = !state.defineEditingId;
}

function renderDefineExample() {
  const experiment = getExperimentById(state.selectedExperimentId);
  const caseRow = getCaseById(experiment, state.selectedCaseId) || experiment.cases[0];

  document.getElementById("exampleInput").textContent = caseRow.input;
  document.getElementById("exampleReference").textContent = caseRow.trace[0]?.detail || "Reference output not available in this dataset.";
  document.getElementById("exampleOutput").textContent = caseRow.output;
}

function renderDefineScreen() {
  renderDefineExample();
}

function renderResultsScreen() {
  const selectedEvaluator = getEvaluatorById(state.selectedEvaluatorId);
  document.getElementById("resultsBadge").textContent = `Evaluator: ${selectedEvaluator.name}`;

  document.getElementById("resultsCharts").innerHTML = [
    renderBars(
      "Conciseness",
      report.experiments.map((experiment) => getConcisenessScore(experiment))
    ),
    renderBars(
      "Correctness",
      report.experiments.map((experiment) => getCorrectnessScore(experiment))
    ),
    renderBars(
      "Simplicity",
      report.experiments.map((experiment) => getSimplicityScore(experiment))
    )
  ].join("");

  const rows = document.getElementById("resultsRows");
  rows.innerHTML = report.experiments
    .map((experiment, index) => {
      const conciseness = getConcisenessScore(experiment);
      const correctness = getCorrectnessScore(experiment);
      const simplicity = getSimplicityScore(experiment);
      const selected = getMetricScore(experiment, selectedEvaluator.id);
      const active = experiment.id === state.selectedExperimentId ? "active" : "";
      return `
        <tr class="${active}" data-results-experiment-id="${escapeHtml(experiment.id)}">
          <td>${escapeHtml(experiment.name)}</td>
          <td>${scoreTag(conciseness)}</td>
          <td>${scoreTag(correctness)}</td>
          <td>${scoreTag(simplicity)}</td>
          <td>${scoreTag(selected)}</td>
          <td>${getCreatedAt(index)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderAnalyzeScreen() {
  const selectedEvaluator = getEvaluatorById(state.selectedEvaluatorId);
  const selectedExperiment = getExperimentById(state.selectedExperimentId);
  document.getElementById("analyzeBadge").textContent = `Experiment: ${selectedExperiment.name} | Evaluator: ${selectedEvaluator.name}`;

  const rowsNode = document.getElementById("analyzeRows");
  rowsNode.innerHTML = selectedExperiment.cases
    .map((caseRow) => {
      const active = caseRow.id === state.selectedCaseId ? "active" : "";
      const evalSelected = getCaseEvaluation(selectedExperiment.id, caseRow, selectedEvaluator.id);
      const correctness = getCaseEvaluation(selectedExperiment.id, caseRow, "eval-groundedness");
      const simplicity = getCaseEvaluation(selectedExperiment.id, caseRow, "eval-safety");

      return `
        <tr class="${active}" data-analyze-case-id="${escapeHtml(caseRow.id)}">
          <td>${escapeHtml(truncate(caseRow.input))}</td>
          <td>${escapeHtml(truncate(correctness.reasoning || "Reference reasoning unavailable."))}</td>
          <td>${escapeHtml(truncate(caseRow.output))}</td>
          <td>${scoreTag(evalSelected.score)}</td>
          <td>${scoreTag(correctness.score)}</td>
          <td>${scoreTag(simplicity.score)}</td>
        </tr>
      `;
    })
    .join("");

  const selectedCase = getCaseById(selectedExperiment, state.selectedCaseId) || selectedExperiment.cases[0];
  const selectedCaseEval = getCaseEvaluation(selectedExperiment.id, selectedCase, selectedEvaluator.id);
  document.getElementById("analyzeCaseTitle").textContent = selectedCase.title;
  document.getElementById("analyzeCaseMeta").textContent = `${selectedCase.id} | ${selectedExperiment.model} | ${selectedCase.latencyMs}ms | ${selectedCase.totalTokens} tokens`;

  const evidence = selectedCaseEval.evidence?.length ? `\nEvidence:\n- ${selectedCaseEval.evidence.join("\n- ")}` : "";
  document.getElementById("analyzeReasoning").textContent = `${selectedCaseEval.reasoning}${evidence}`;

  document.getElementById("analyzeTrace").innerHTML = selectedCase.trace
    .map(
      (step, index) => `
      <li>
        <strong>${index + 1}. ${escapeHtml(step.node)}</strong>
        <div class="muted small">${escapeHtml(step.step)} | ${step.durationMs}ms | ${step.tokens} tokens</div>
        <div class="small">${escapeHtml(step.detail)}</div>
      </li>
    `
    )
    .join("");
}

function wireGlobalEvents() {
  document.getElementById("navPrev").addEventListener("click", prevScreen);
  document.getElementById("navNext").addEventListener("click", nextScreen);

  document.getElementById("stepper").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-screen]");
    if (!button) {
      return;
    }
    setScreen(button.dataset.screen);
  });

  document.getElementById("selectContinueBtn").addEventListener("click", () => {
    populateDefineForm("auto");
    setScreen("define");
  });

  document.getElementById("createOwnEvaluatorBtn").addEventListener("click", () => {
    populateDefineForm("new");
    setDefineFormMessage("Creating a new custom evaluator.");
    setScreen("define");
  });

  document.getElementById("selectSearch").addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim();
    renderSelectScreen();
  });

  document.getElementById("evaluatorMenu").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-evaluator-id]");
    if (!button) {
      return;
    }

    state.selectedEvaluatorId = button.getAttribute("data-evaluator-id");
    renderShell();
    saveSelections();
  });

  document.getElementById("selectExperimentRows").addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-select-experiment-id]");
    if (!row) {
      return;
    }

    state.selectedExperimentId = row.getAttribute("data-select-experiment-id");
    const experiment = getExperimentById(state.selectedExperimentId);
    state.selectedCaseId = experiment.cases[0].id;
    saveSelections();
    renderShell();
  });

  document.getElementById("defineDiscardBtn").addEventListener("click", () => {
    populateDefineForm("auto");
    setDefineFormMessage("Changes discarded.");
  });

  document.getElementById("defineDeleteBtn").addEventListener("click", () => {
    if (!state.defineEditingId) {
      return;
    }

    state.customEvaluators = state.customEvaluators.filter((evaluator) => evaluator.id !== state.defineEditingId);
    saveCustomEvaluators();

    state.selectedEvaluatorId = report.evaluatorCatalog[0].id;
    state.defineEditingId = null;
    populateDefineForm("auto");
    setDefineFormMessage("Custom evaluator deleted.");
    renderShell();
  });

  document.getElementById("defineForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("defineName").value.trim();
    const category = document.getElementById("defineCategory").value;
    const model = document.getElementById("defineModel").value;
    const threshold = Number(document.getElementById("defineThreshold").value);
    const rubric = document.getElementById("defineRubric").value.trim();

    if (!name || !rubric) {
      setDefineFormMessage("Name and rubric are required.", true);
      return;
    }

    const normalizedThreshold = Number.isFinite(threshold) ? Math.min(1, Math.max(0, threshold)) : 0.8;

    if (state.defineEditingId) {
      state.customEvaluators = state.customEvaluators.map((evaluator) => {
        if (evaluator.id !== state.defineEditingId) {
          return evaluator;
        }
        return {
          ...evaluator,
          name,
          category,
          model,
          threshold: round(normalizedThreshold, 2),
          rubric,
          description: "User-defined evaluator"
        };
      });
      state.selectedEvaluatorId = state.defineEditingId;
      setDefineFormMessage(`Saved updates to ${name}.`);
    } else {
      const duplicate = state.customEvaluators.some((evaluator) => evaluator.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        setDefineFormMessage("A custom evaluator with this name already exists.", true);
        return;
      }

      const newEvaluator = {
        id: `custom-${Date.now().toString(36)}`,
        name,
        category,
        model,
        threshold: round(normalizedThreshold, 2),
        rubric,
        description: "User-defined evaluator"
      };
      state.customEvaluators.push(newEvaluator);
      state.selectedEvaluatorId = newEvaluator.id;
      state.defineEditingId = newEvaluator.id;
      setDefineFormMessage(`Created custom evaluator ${name}.`);
    }

    saveCustomEvaluators();
    saveSelections();
    renderShell();
  });

  document.getElementById("resultsRows").addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-results-experiment-id]");
    if (!row) {
      return;
    }

    state.selectedExperimentId = row.getAttribute("data-results-experiment-id");
    const experiment = getExperimentById(state.selectedExperimentId);
    state.selectedCaseId = experiment.cases[0].id;
    saveSelections();
    renderShell();
  });

  document.getElementById("resultsAnalyzeBtn").addEventListener("click", () => {
    setScreen("analyze");
  });

  document.getElementById("analyzeRows").addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-analyze-case-id]");
    if (!row) {
      return;
    }
    state.selectedCaseId = row.getAttribute("data-analyze-case-id");
    saveSelections();
    renderAnalyzeScreen();
  });

  window.addEventListener("hashchange", () => {
    const hashValue = window.location.hash.replace("#", "");
    if (SCREENS.includes(hashValue)) {
      state.activeScreen = hashValue;
      renderShell();
    }
  });
}

function renderError(error) {
  document.body.innerHTML = `
    <div style="padding:16px; font-family: sans-serif;">
      <h1>Unable to load prototype</h1>
      <p>Serve from repository root and open <code>/prototype/prompt-3/</code>.</p>
      <pre>${escapeHtml(error.message)}</pre>
    </div>
  `;
}

async function start() {
  try {
    report = await loadReport();
    state.customEvaluators = loadCustomEvaluators();
    state.selectedEvaluatorId = localStorage.getItem(STORAGE_KEYS.selectedEvaluator);
    state.selectedExperimentId = localStorage.getItem(STORAGE_KEYS.selectedExperiment);
    state.selectedCaseId = localStorage.getItem(STORAGE_KEYS.selectedCase);

    const hashScreen = window.location.hash.replace("#", "");
    if (SCREENS.includes(hashScreen)) {
      state.activeScreen = hashScreen;
    }

    ensureValidState();
    populateDefineForm("auto");
    wireGlobalEvents();
    renderShell();
  } catch (error) {
    renderError(error);
  }
}

start();
