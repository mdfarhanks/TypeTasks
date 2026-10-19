/**
 * TaskStatus defines the possible states for any task in TypeTasks.
 * A task can only ever be in one of these three exact states.
 */
export type TaskStatus = "todo" | "in-progress" | "done";

/**
 * Task represents the core data model of a single task.
 */
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

/**
 * Appends a new task with status "todo" and a unique numerical ID.
 * Returns a new array, preserving immutability.
 */
export function addTask(tasks: Task[], title: string): Task[] {
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask: Task = {
    id: nextId,
    title,
    status: "todo",
  };
  return [...tasks, newTask];
}

/**
 * Marks a task with the matching ID as "done".
 * Returns a new array, preserving immutability.
 */
export function completeTask(tasks: Task[], id: number): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, status: "done" } : task
  );
}

/**
 * Filters the list of tasks by the provided TaskStatus.
 * Only values strictly matching the TaskStatus union are accepted by TypeScript.
 */
export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

// ==========================================
// Custom Operations ("Make It Yours")
// ==========================================

/**
 * Advances a task's status sequentially:
 * "todo" -> "in-progress" -> "done".
 * If the task is already "done", its status remains "done".
 */
export function advanceTask(tasks: Task[], id: number): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    let nextStatus: TaskStatus = task.status;
    if (task.status === "todo") {
      nextStatus = "in-progress";
    } else if (task.status === "in-progress") {
      nextStatus = "done";
    }

    return { ...task, status: nextStatus };
  });
}

/**
 * Removes a task with the specified ID from the task list.
 * Returns a new array, preserving immutability.
 */
export function deleteTask(tasks: Task[], id: number): Task[] {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Counts the number of tasks having the specified status.
 */
export function countByStatus(tasks: Task[], status: TaskStatus): number {
  return tasks.filter((task) => task.status === status).length;
}

/**
 * Updates the title of an existing task by ID.
 * Returns a new array, preserving immutability.
 */
export function updateTaskTitle(tasks: Task[], id: number, newTitle: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, title: newTitle } : task
  );
}
