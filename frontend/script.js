// Backend API endpoint (from the existing backend implementation)
const API_URL = "http://127.0.0.1:8000/summarize";

const audioInput = document.getElementById("audioInput");
const fileNameText = document.getElementById("fileName");
const summarizeBtn = document.getElementById("summarizeBtn");
const summarizeBtnText = document.getElementById("summarizeBtnText");
const loadingMsg = document.getElementById("loadingMsg");
const errorMsg = document.getElementById("errorMsg");
const errorMsgText = document.getElementById("errorMsgText");
const successMsg = document.getElementById("successMsg");

const transcriptOutput = document.getElementById("transcriptOutput");
const summaryOutput = document.getElementById("summaryOutput");
const actionItemsOutput = document.getElementById("actionItemsOutput");

const DEFAULT_BTN_LABEL = "Summarize Meeting";
const LOADING_BTN_LABEL = "Analyzing...";

let selectedFile = null;

// Show the name of the file chosen by the user
audioInput.addEventListener("change", function () {
  if (audioInput.files.length > 0) {
    selectedFile = audioInput.files[0];
    fileNameText.textContent = selectedFile.name;
  } else {
    selectedFile = null;
    fileNameText.textContent = "No file selected";
  }
});

summarizeBtn.addEventListener("click", async function () {
  // Clear previous results and errors before starting a new request
  clearResults();
  hideError();
  hideSuccess();

  if (!selectedFile) {
    showError("Please select an audio file before summarizing.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  showLoading();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Backend returned an error. Please try again.");
    }

    const data = await response.json();

    displayResults(data);
    showSuccess();
  } catch (error) {
    showError("Could not summarize the meeting. " + error.message);
  } finally {
    hideLoading();
  }
});

function displayResults(data) {
  if (!data.summary) {
    transcriptOutput.textContent = "No summary available.";
    summaryOutput.textContent = "No key decisions found.";
    actionItemsOutput.textContent = "No tasks to complete.";
    return;
  }

  const text = data.summary;

  // Tolerant header patterns: the backend prompt asks the LLM for plain
  // "SUMMARY:" / "KEY DECISIONS:" / "TASKS TO COMPLETE:" headings, but the
  // LLM does not always follow that literally — it sometimes wraps the
  // heading in Markdown ("### 1. Summary", "**Key Decisions**") or uses
  // "Action Items" instead of "Tasks to Complete". These patterns accept
  // that variation while still matching the plain format exactly as before.
  const HEADING_PREFIX = "(?:#{1,3}\\s*)?\\*{0,2}\\s*(?:\\d+[.)]\\s*)?";
  const HEADING_SUFFIX = "\\*{0,2}\\s*:?";

  const SUMMARY_HEADER = HEADING_PREFIX + "SUMMARY" + HEADING_SUFFIX;
  const DECISIONS_HEADER = HEADING_PREFIX + "KEY DECISIONS" + HEADING_SUFFIX;
  const TASKS_HEADER =
    HEADING_PREFIX + "(?:TASKS TO COMPLETE|ACTION ITEMS)" + HEADING_SUFFIX;

  const summaryMatch = text.match(
    new RegExp(
      SUMMARY_HEADER + "\\s*([\\s\\S]*?)(?=" + DECISIONS_HEADER + "|" + TASKS_HEADER + "|$)",
      "i"
    )
  );

  const decisionsMatch = text.match(
    new RegExp(
      DECISIONS_HEADER + "\\s*([\\s\\S]*?)(?=" + TASKS_HEADER + "|$)",
      "i"
    )
  );

  const tasksMatch = text.match(
    new RegExp(TASKS_HEADER + "\\s*([\\s\\S]*)", "i")
  );

  // TRANSCRIPT SUMMARIZED
  transcriptOutput.textContent = summaryMatch
    ? summaryMatch[1].trim()
    : "No summary available.";

  // KEY DECISIONS
  summaryOutput.innerHTML = "";

  if (decisionsMatch && decisionsMatch[1].trim()) {
    const decisions = decisionsMatch[1]
      .trim()
      .split("\n")
      .filter(item => item.trim() !== "");

    decisions.forEach(item => {
      const p = document.createElement("p");
      p.textContent = "• " + item.replace(/^[-•]\s*/, "");
      summaryOutput.appendChild(p);
    });
  } else {
    summaryOutput.textContent = "No key decisions found.";
  }

  // TASKS TO COMPLETE
  actionItemsOutput.innerHTML = "";

  if (tasksMatch && tasksMatch[1].trim()) {
    const tasks = tasksMatch[1]
      .trim()
      .split("\n")
      .filter(item => item.trim() !== "");

    tasks.forEach(item => {
      const p = document.createElement("p");
      p.textContent = "• " + item.replace(/^[-•]\s*/, "");
      actionItemsOutput.appendChild(p);
    });
  } else {
    actionItemsOutput.textContent = "No tasks to complete.";
  }
}


function clearResults() {
  transcriptOutput.textContent = "";
  summaryOutput.textContent = "";
  actionItemsOutput.textContent = "";
}

function showLoading() {
  loadingMsg.classList.remove("hidden");
  summarizeBtn.disabled = true;
  summarizeBtnText.textContent = LOADING_BTN_LABEL;
}

function hideLoading() {
  loadingMsg.classList.add("hidden");
  summarizeBtn.disabled = false;
  summarizeBtnText.textContent = DEFAULT_BTN_LABEL;
}

function showError(message) {
  errorMsgText.textContent = message;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsgText.textContent = "";
  errorMsg.classList.add("hidden");
}

function showSuccess() {
  successMsg.classList.remove("hidden");
}

function hideSuccess() {
  successMsg.classList.add("hidden");
}