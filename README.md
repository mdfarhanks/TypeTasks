# TypeTasks - Part 1: Typed Data Model

TypeTasks is a type-safe task tracker built with TypeScript. This repository contains **Part 1: The Typed Logic Layer**, defining the foundational data model and immutable task operations with strict type-checking and zero compiler errors.

## Data Model & Types

### `TaskStatus`
A literal union type representing all possible task statuses:
```typescript
type TaskStatus = "todo" | "in-progress" | "done";
```

### `Task`
The core task interface:
```typescript
interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}
```

## Core Operations

- `addTask(tasks: Task[], title: string): Task[]` — Appends a new task with unique numerical ID and `"todo"` status (immutable).
- `completeTask(tasks: Task[], id: number): Task[]` — Updates matching task's status to `"done"` (immutable).
- `filterByStatus(tasks: Task[], status: TaskStatus): Task[]` — Returns tasks matching the specified status. Enforces `TaskStatus` union at compile time.

## Custom Operations ("Make It Yours")

- `advanceTask(tasks: Task[], id: number): Task[]` — Moves a task through the workflow: `"todo"` &rarr; `"in-progress"` &rarr; `"done"`.
- `deleteTask(tasks: Task[], id: number): Task[]` — Immutably removes a task by ID.
- `countByStatus(tasks: Task[], status: TaskStatus): number` — Counts tasks currently matching a status.
- `updateTaskTitle(tasks: Task[], id: number, newTitle: string): Task[]` — Immutably updates the title of a task.

## Verification & Compilation

Compile the project with TypeScript compiler:
```bash
npx tsc
```
Compiled with zero errors under `"strict": true`.
