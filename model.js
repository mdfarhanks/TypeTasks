/**
 * Appends a new task with status "todo" and a unique numerical ID.
 * Returns a new array, preserving immutability.
 */
export function addTask(tasks, title) {
    const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask = {
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
export function completeTask(tasks, id) {
    return tasks.map((task) => task.id === id ? { ...task, status: "done" } : task);
}
/**
 * Filters the list of tasks by the provided TaskStatus.
 * Only values strictly matching the TaskStatus union are accepted by TypeScript.
 */
export function filterByStatus(tasks, status) {
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
export function advanceTask(tasks, id) {
    return tasks.map((task) => {
        if (task.id !== id)
            return task;
        let nextStatus = task.status;
        if (task.status === "todo") {
            nextStatus = "in-progress";
        }
        else if (task.status === "in-progress") {
            nextStatus = "done";
        }
        return { ...task, status: nextStatus };
    });
}
/**
 * Removes a task with the specified ID from the task list.
 * Returns a new array, preserving immutability.
 */
export function deleteTask(tasks, id) {
    return tasks.filter((task) => task.id !== id);
}
/**
 * Counts the number of tasks having the specified status.
 */
export function countByStatus(tasks, status) {
    return tasks.filter((task) => task.status === status).length;
}
/**
 * Updates the title of an existing task by ID.
 * Returns a new array, preserving immutability.
 */
export function updateTaskTitle(tasks, id, newTitle) {
    return tasks.map((task) => task.id === id ? { ...task, title: newTitle } : task);
}
