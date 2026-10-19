import {
  Task,
  TaskStatus,
  addTask,
  completeTask,
  filterByStatus,
  advanceTask,
  deleteTask,
  countByStatus,
} from "./model.js";

// ==========================================
// Types & State Management
// ==========================================

type FilterType = "all" | TaskStatus;

const STORAGE_KEY = "typetasks_flow_tasks_v1";

// Initial seed data if no stored tasks exist
const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Design strict Task interface in model.ts", status: "done" },
  { id: 2, title: "Connect interactive UI to typed operations", status: "in-progress" },
  { id: 3, title: "Deploy TypeTasks app to live public URL", status: "todo" },
];

/**
 * Loads tasks from localStorage with type-safe fallback.
 */
function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return INITIAL_TASKS;

    // Validate each item to guarantee Task shape
    const validatedTasks: Task[] = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof (item as Task).id === "number" &&
        typeof (item as Task).title === "string" &&
        ["todo", "in-progress", "done"].includes((item as Task).status)
      ) {
        validatedTasks.push(item as Task);
      }
    }
    return validatedTasks;
  } catch {
    return INITIAL_TASKS;
  }
}

/**
 * Persists tasks to localStorage.
 */
function saveTasks(taskList: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
  } catch (err) {
    console.error("Failed to save tasks:", err);
  }
}

let tasks: Task[] = loadTasks();
let currentFilter: FilterType = "all";

// ==========================================
// DOM Elements (Strictly Typed)
// ==========================================

const taskForm = document.getElementById("task-form") as HTMLFormElement;
const taskInput = document.getElementById("task-input") as HTMLInputElement;
const taskList = document.getElementById("task-list") as HTMLUListElement;
const emptyState = document.getElementById("empty-state") as HTMLDivElement;
const emptySubtitle = document.getElementById("empty-subtitle") as HTMLParagraphElement;

const progressFill = document.getElementById("progress-fill") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const metricsPercent = document.getElementById("metrics-percent") as HTMLSpanElement;
const metricsSummary = document.getElementById("metrics-summary") as HTMLSpanElement;

const countAll = document.getElementById("count-all") as HTMLSpanElement;
const countTodo = document.getElementById("count-todo") as HTMLSpanElement;
const countInProgress = document.getElementById("count-inprogress") as HTMLSpanElement;
const countDone = document.getElementById("count-done") as HTMLSpanElement;

const filterChips = document.querySelectorAll<HTMLButtonElement>(".filter-chip");

// ==========================================
// Rendering Logic
// ==========================================

/**
 * Returns a human-readable display label for a TaskStatus.
 */
function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "Todo";
    case "in-progress":
      return "In Progress";
    case "done":
      return "Done";
  }
}

/**
 * Returns the button action text for the advance operation.
 */
function getAdvanceButtonLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "Start →";
    case "in-progress":
      return "Finish →";
    case "done":
      return "Completed ✓";
  }
}

/**
 * Updates metrics, counters, and progress bar based on current tasks array.
 */
function updateMetrics(): void {
  const total = tasks.length;
  const todoCount = countByStatus(tasks, "todo");
  const inProgressCount = countByStatus(tasks, "in-progress");
  const doneCount = countByStatus(tasks, "done");

  countAll.textContent = String(total);
  countTodo.textContent = String(todoCount);
  countInProgress.textContent = String(inProgressCount);
  countDone.textContent = String(doneCount);

  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));
  metricsPercent.textContent = `${percent}%`;
  metricsSummary.textContent = `${doneCount} of ${total} Completed (${percent}%)`;
}

/**
 * Renders the visible task list and updates all UI components.
 */
function render(): void {
  // Update header metrics & chip counts
  updateMetrics();

  // Filter tasks based on currentFilter
  const visibleTasks: Task[] =
    currentFilter === "all"
      ? tasks
      : filterByStatus(tasks, currentFilter);

  // Clear previous list
  taskList.innerHTML = "";

  if (visibleTasks.length === 0) {
    emptyState.style.display = "flex";
    if (tasks.length === 0) {
      emptySubtitle.textContent = "Your task list is empty. Add a task above to begin!";
    } else {
      emptySubtitle.textContent = `No tasks currently in the "${getStatusLabel(
        currentFilter as TaskStatus
      )}" state.`;
    }
  } else {
    emptyState.style.display = "none";

    for (const task of visibleTasks) {
      const li = document.createElement("li");
      li.className = `task-item status-${task.status}`;
      li.dataset["id"] = String(task.id);

      // Task Main Info
      const mainDiv = document.createElement("div");
      mainDiv.className = "task-main";

      const idBadge = document.createElement("span");
      idBadge.className = "task-id-badge";
      idBadge.textContent = `#${task.id}`;

      const titleSpan = document.createElement("span");
      titleSpan.className = "task-title";
      titleSpan.textContent = task.title;

      const statusPill = document.createElement("span");
      statusPill.className = `status-pill ${task.status}`;
      statusPill.textContent = getStatusLabel(task.status);

      mainDiv.appendChild(idBadge);
      mainDiv.appendChild(titleSpan);
      mainDiv.appendChild(statusPill);

      // Task Action Buttons
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      // 1. Advance button (todo -> in-progress -> done)
      if (task.status !== "done") {
        const advanceBtn = document.createElement("button");
        advanceBtn.type = "button";
        advanceBtn.className = "btn-action btn-advance";
        advanceBtn.textContent = getAdvanceButtonLabel(task.status);
        advanceBtn.title = "Advance task to next stage";
        advanceBtn.setAttribute("aria-label", `Advance task ${task.title}`);
        advanceBtn.addEventListener("click", () => handleAdvance(task.id));
        actionsDiv.appendChild(advanceBtn);
      }

      // 2. Direct Complete button
      if (task.status !== "done") {
        const completeBtn = document.createElement("button");
        completeBtn.type = "button";
        completeBtn.className = "btn-action btn-complete";
        completeBtn.textContent = "Complete ✓";
        completeBtn.title = "Mark task as Done directly";
        completeBtn.setAttribute("aria-label", `Complete task ${task.title}`);
        completeBtn.addEventListener("click", () => handleComplete(task.id));
        actionsDiv.appendChild(completeBtn);
      }

      // 3. Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-action btn-delete";
      deleteBtn.innerHTML = "✕";
      deleteBtn.title = "Delete task";
      deleteBtn.setAttribute("aria-label", `Delete task ${task.title}`);
      deleteBtn.addEventListener("click", () => handleDelete(task.id));
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(mainDiv);
      li.appendChild(actionsDiv);
      taskList.appendChild(li);
    }
  }
}

// ==========================================
// Event Handlers (Typed Operations)
// ==========================================

/**
 * Handles adding a new task via the typed `addTask` operation.
 */
function handleAddTask(event: SubmitEvent): void {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  // Run typed addTask logic from model.ts
  tasks = addTask(tasks, title);
  saveTasks(tasks);

  taskInput.value = "";
  taskInput.focus();
  render();
}

/**
 * Handles advancing a task through the workflow ("todo" -> "in-progress" -> "done").
 */
function handleAdvance(id: number): void {
  tasks = advanceTask(tasks, id);
  saveTasks(tasks);
  render();
}

/**
 * Handles completing a task via the typed `completeTask` operation.
 */
function handleComplete(id: number): void {
  tasks = completeTask(tasks, id);
  saveTasks(tasks);
  render();
}

/**
 * Handles deleting a task via the typed `deleteTask` operation.
 */
function handleDelete(id: number): void {
  tasks = deleteTask(tasks, id);
  saveTasks(tasks);
  render();
}

/**
 * Handles switching the active filter.
 */
function handleFilterChange(filterValue: string): void {
  if (
    filterValue === "all" ||
    filterValue === "todo" ||
    filterValue === "in-progress" ||
    filterValue === "done"
  ) {
    currentFilter = filterValue as FilterType;

    // Update active tab styling & aria-selected
    filterChips.forEach((chip) => {
      const chipFilter = chip.dataset["filter"];
      const isActive = chipFilter === currentFilter;
      chip.classList.toggle("active", isActive);
      chip.setAttribute("aria-selected", String(isActive));
    });

    render();
  }
}

// ==========================================
// Initial Setup & Listeners
// ==========================================

taskForm.addEventListener("submit", (e: SubmitEvent) => handleAddTask(e));

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filterValue = chip.dataset["filter"];
    if (filterValue) {
      handleFilterChange(filterValue);
    }
  });
});

// Initial Render
render();
