import {
  compareOptionalIsoDatesAsc,
  isFutureDate,
  isSameCalendarDay,
} from "../../lib/dates";
import { generateId } from "../../lib/ids";
import type {
  CreateTodoInput,
  Todo,
  TodoFilterOptions,
  TodoPriority,
  TodoSortOption,
  UpdateTodoInput,
} from "./types";
import { DEFAULT_CATEGORY_NAME } from "./types";

const priorityWeight: Record<TodoPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

type CreateTodoOptions = {
  id?: string;
  now?: Date;
};

export function normalizeTodoTitle(title: string): string {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error("任务标题不能为空");
  }

  return normalizedTitle;
}

export function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

export function createTodo(input: CreateTodoInput, options: CreateTodoOptions = {}): Todo {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();

  return {
    id: options.id ?? generateId(),
    title: normalizeTodoTitle(input.title),
    note: normalizeOptionalText(input.note),
    startDate: normalizeOptionalText(input.startDate),
    dueDate: normalizeOptionalText(input.dueDate),
    priority: input.priority ?? "medium",
    category: normalizeOptionalText(input.category) ?? DEFAULT_CATEGORY_NAME,
    completed: false,
    order: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateTodo(
  todo: Todo,
  patch: UpdateTodoInput,
  updatedAt: Date = new Date(),
): Todo {
  return {
    ...todo,
    title: typeof patch.title === "string" ? normalizeTodoTitle(patch.title) : todo.title,
    note: "note" in patch ? normalizeOptionalText(patch.note) : todo.note,
    startDate: "startDate" in patch ? normalizeOptionalText(patch.startDate) : todo.startDate,
    dueDate: "dueDate" in patch ? normalizeOptionalText(patch.dueDate) : todo.dueDate,
    priority: patch.priority ?? todo.priority,
    category:
      "category" in patch
        ? normalizeOptionalText(patch.category) ?? DEFAULT_CATEGORY_NAME
        : todo.category ?? DEFAULT_CATEGORY_NAME,
    updatedAt: updatedAt.toISOString(),
  };
}

export function toggleTodoCompletion(
  todo: Todo,
  completed: boolean,
  updatedAt: Date = new Date(),
): Todo {
  return {
    ...todo,
    completed,
    completedAt: completed ? updatedAt.toISOString() : undefined,
    updatedAt: updatedAt.toISOString(),
  };
}

export function matchesTodoView(
  todo: Todo,
  view: TodoFilterOptions["view"],
  referenceDate: Date = new Date(),
): boolean {
  if (view === "all") {
    return true;
  }

  if (view === "completed") {
    return todo.completed;
  }

  if (todo.completed) {
    return false;
  }

  if (view === "today") {
    return isSameCalendarDay(todo.dueDate, referenceDate);
  }

  return isFutureDate(todo.dueDate, referenceDate);
}

export function matchesSearchQuery(todo: Todo, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [todo.title, todo.note]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalizedQuery));
}

export function filterTodos(todos: Todo[], options: TodoFilterOptions): Todo[] {
  const {
    view,
    referenceDate = new Date(),
    searchQuery = "",
    priority,
    date = "all",
    category,
    completed,
  } = options;

  return todos.filter((todo) => {
    if (!matchesTodoView(todo, view, referenceDate)) {
      return false;
    }

    if (!matchesSearchQuery(todo, searchQuery)) {
      return false;
    }

    if (priority && todo.priority !== priority) {
      return false;
    }

    if (!matchesDateFilter(todo, date, referenceDate)) {
      return false;
    }

    if (category && todo.category !== category) {
      return false;
    }

    if (typeof completed === "boolean" && todo.completed !== completed) {
      return false;
    }

    return true;
  });
}

function matchesDateFilter(
  todo: Todo,
  date: NonNullable<TodoFilterOptions["date"]>,
  referenceDate: Date,
): boolean {
  if (date === "all") {
    return true;
  }

  if (date === "today") {
    return isSameCalendarDay(todo.dueDate, referenceDate);
  }

  if (date === "future") {
    return isFutureDate(todo.dueDate, referenceDate);
  }

  return !todo.dueDate;
}

export function sortTodos(todos: Todo[], sortBy: TodoSortOption): Todo[] {
  return [...todos].sort((first, second) => {
    if (first.completed !== second.completed) {
      return first.completed ? 1 : -1;
    }

    if (sortBy === "priority") {
      return comparePriority(first, second) || compareDueDate(first, second);
    }

    if (sortBy === "createdAt") {
      return first.createdAt.localeCompare(second.createdAt);
    }

    return compareDueDate(first, second) || comparePriority(first, second);
  });
}

function compareDueDate(first: Todo, second: Todo): number {
  return compareOptionalIsoDatesAsc(first.dueDate, second.dueDate);
}

function comparePriority(first: Todo, second: Todo): number {
  return priorityWeight[first.priority] - priorityWeight[second.priority];
}
