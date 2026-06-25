import { describe, expect, it } from "vitest";
import {
  createTodo,
  filterTodos,
  matchesSearchQuery,
  sortTodos,
  toggleTodoCompletion,
  updateTodo,
} from "./utils";
import { DEFAULT_CATEGORY_NAME, type Todo } from "./types";

const now = new Date("2026-06-24T09:00:00.000Z");

function todo(overrides: Partial<Todo>): Todo {
  return {
    id: "todo-1",
    title: "默认任务",
    priority: "medium",
    completed: false,
    order: 0,
    createdAt: "2026-06-24T08:00:00.000Z",
    updatedAt: "2026-06-24T08:00:00.000Z",
    category: DEFAULT_CATEGORY_NAME,
    ...overrides,
  };
}

describe("todo utilities", () => {
  it("creates todos with trimmed title and documented defaults", () => {
    const created = createTodo(
      {
        title: "  写 PRD  ",
        note: "  补充验收  ",
        startDate: " 2026-06-24 ",
      },
      { id: "todo-created", now },
    );

    expect(created).toMatchObject({
      id: "todo-created",
      title: "写 PRD",
      note: "补充验收",
      startDate: "2026-06-24",
      priority: "medium",
      category: DEFAULT_CATEGORY_NAME,
      completed: false,
      order: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(created.completedAt).toBeUndefined();
  });

  it("rejects empty titles", () => {
    expect(() => createTodo({ title: "   " }, { id: "todo-empty", now })).toThrow(
      "任务标题不能为空",
    );
  });

  it("updates todos with normalized fields and refreshed updatedAt", () => {
    const updated = updateTodo(
      todo({ title: "旧标题", startDate: "2026-06-24" }),
      {
        title: "  新标题  ",
        category: "  工作  ",
        startDate: " 2026-06-25 ",
      },
      now,
    );

    expect(updated.title).toBe("新标题");
    expect(updated.category).toBe("工作");
    expect(updated.startDate).toBe("2026-06-25");
    expect(updated.updatedAt).toBe(now.toISOString());
  });

  it("falls back to default category when update clears category", () => {
    const updated = updateTodo(todo({ category: "工作" }), { category: "   " }, now);
    expect(updated.category).toBe(DEFAULT_CATEGORY_NAME);
  });

  it("sets and clears completedAt when toggling completion", () => {
    const completed = toggleTodoCompletion(todo({ completed: false }), true, now);
    expect(completed.completed).toBe(true);
    expect(completed.completedAt).toBe(now.toISOString());

    const reopened = toggleTodoCompletion(completed, false, now);
    expect(reopened.completed).toBe(false);
    expect(reopened.completedAt).toBeUndefined();
  });

  it("filters todos by primary views", () => {
    const todos = [
      todo({ id: "today", dueDate: "2026-06-24T00:00:00.000Z" }),
      todo({ id: "future", dueDate: "2026-06-25T00:00:00.000Z" }),
      todo({ id: "completed", completed: true }),
    ];

    expect(filterTodos(todos, { view: "today", referenceDate: now }).map((item) => item.id)).toEqual([
      "today",
    ]);
    expect(filterTodos(todos, { view: "future", referenceDate: now }).map((item) => item.id)).toEqual([
      "future",
    ]);
    expect(
      filterTodos(todos, { view: "completed", referenceDate: now }).map((item) => item.id),
    ).toEqual(["completed"]);
  });

  it("keeps today and future views based on dueDate only", () => {
    const todos = [
      todo({
        id: "only-start-date",
        title: "只有开始日期",
        startDate: "2026-06-24",
      }),
      todo({
        id: "due-today",
        title: "截止今天",
        startDate: "2026-06-23",
        dueDate: "2026-06-24T00:00:00.000Z",
      }),
    ];

    expect(filterTodos(todos, { view: "today", referenceDate: now }).map((item) => item.id)).toEqual([
      "due-today",
    ]);
    expect(filterTodos(todos, { view: "future", referenceDate: now })).toEqual([]);
  });

  it("filters todos by priority, date, completion, and category", () => {
    const todos = [
      todo({
        id: "work-today",
        title: "工作任务",
        priority: "high",
        category: "工作",
        dueDate: "2026-06-24T00:00:00.000Z",
      }),
      todo({
        id: "life-no-date",
        title: "生活任务",
        priority: "low",
        category: "生活",
      }),
      todo({
        id: "done-work",
        title: "已完成工作",
        priority: "high",
        category: "工作",
        completed: true,
        dueDate: "2026-06-25T00:00:00.000Z",
      }),
    ];

    expect(
      filterTodos(todos, {
        view: "all",
        referenceDate: now,
        priority: "high",
        date: "today",
        completed: false,
        category: "工作",
      }).map((item) => item.id),
    ).toEqual(["work-today"]);

    expect(
      filterTodos(todos, {
        view: "all",
        referenceDate: now,
        date: "noDate",
      }).map((item) => item.id),
    ).toEqual(["life-no-date"]);
  });

  it("matches search query against title and note", () => {
    const target = todo({ title: "准备周会", note: "整理项目风险" });

    expect(matchesSearchQuery(target, "周会")).toBe(true);
    expect(matchesSearchQuery(target, "风险")).toBe(true);
    expect(matchesSearchQuery(target, "不存在")).toBe(false);
    expect(matchesSearchQuery(target, " ")).toBe(true);
  });

  it("sorts unfinished todos before completed and then by due date and priority", () => {
    const sorted = sortTodos(
      [
        todo({ id: "done", completed: true, dueDate: "2026-06-24T00:00:00.000Z" }),
        todo({ id: "later", priority: "high", dueDate: "2026-06-25T00:00:00.000Z" }),
        todo({ id: "urgent", priority: "high", dueDate: "2026-06-24T00:00:00.000Z" }),
        todo({ id: "normal", priority: "medium", dueDate: "2026-06-24T00:00:00.000Z" }),
      ],
      "dueDate",
    );

    expect(sorted.map((item) => item.id)).toEqual(["urgent", "normal", "later", "done"]);
  });
});
