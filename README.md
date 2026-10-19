# TypeTasks Flow — Type-Safe Task Tracker

TypeTasks Flow is a sleek, modern, type-safe task tracker built with **HTML5, CSS3, and strict TypeScript**. 

- **Live URL**: [https://mdfarhanks.github.io/TypeTasks/](https://mdfarhanks.github.io/TypeTasks/)
- **Repository URL**: [https://github.com/mdfarhanks/TypeTasks](https://github.com/mdfarhanks/TypeTasks)

---

## Architecture Overview

TypeTasks is built in two distinct layers:
1. **Typed Logic Layer (`model.ts`)**: Defines the data model, strict status unions, and pure immutable task operations with compile-time safety.
2. **Interactive UI Layer (`index.html`, `styles.css`, `app.ts`)**: A modern dark glassmorphism interface wired directly to typed operations with strict DOM casting (zero untyped logic, zero `any`).

---

## 1. Data Model (`model.ts`)

### `TaskStatus`
A literal union type representing all allowable task states:
```typescript
export type TaskStatus = "todo" | "in-progress" | "done";
```

### `Task` Interface
The core task interface:
```typescript
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}
```

### Typed Operations
- `addTask(tasks: Task[], title: string): Task[]` — Appends a new task with unique numerical ID and `"todo"` status (immutable).
- `completeTask(tasks: Task[], id: number): Task[]` — Immutably sets task status to `"done"`.
- `filterByStatus(tasks: Task[], status: TaskStatus): Task[]` — Filters tasks strictly by `TaskStatus`. Invalid status strings cause compile-time errors.
- `advanceTask(tasks: Task[], id: number): Task[]` — Moves tasks sequentially: `"todo"` &rarr; `"in-progress"` &rarr; `"done"`.
- `deleteTask(tasks: Task[], id: number): Task[]` — Immutably removes a task by ID.
- `countByStatus(tasks: Task[], status: TaskStatus): number` — Counts tasks matching a status.
- `updateTaskTitle(tasks: Task[], id: number, newTitle: string): Task[]` — Modifies task title preserving all other properties.

---

## 2. Interactive UI (`app.ts`, `index.html`, `styles.css`)

- **Add Tasks**: Form submission calls `addTask` and updates the reactive UI.
- **Advance & Complete**: Action buttons call `advanceTask` and `completeTask` to transition statuses.
- **Filters**: Interactive chip tabs (`All`, `Todo`, `In Progress`, `Done`) call `filterByStatus` with live counts.
- **Progress Tracking**: Real-time completion percentage and visual progress bar.
- **Persistence**: Type-validated `localStorage` persistence preserves data across page reloads.

---

## 3. Compilation & Building

Compile both `model.ts` and `app.ts` with zero type errors:

```bash
# Run TypeScript compilation
npm run build
# Or directly with tsc:
npx tsc
```

The compiled JavaScript files (`model.js` and `app.js`) are emitted in the root directory for direct native ES module consumption via:
```html
<script type="module" src="app.js"></script>
```

---

## 4. Deployment Instructions

### GitHub Pages
1. Push your repository to GitHub.
2. Navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or `part-2-ui-ship`), folder: `/ (root)`.
4. Click **Save**. The app will be live at `https://mdfarhanks.github.io/TypeTasks/` within minutes.
