import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORY_NAME,
  PRESET_CATEGORY_NAMES,
  TODO_FILTERS,
  TODO_PRIORITIES,
  TODO_SORT_OPTIONS,
  type Category,
  type Todo,
  type TodoFilter,
  type TodoPriority,
} from "./types";

describe("todo types", () => {
  it("defines stable priority, filter, sort, and preset category values", () => {
    expect(TODO_PRIORITIES).toEqual(["low", "medium", "high"]);
    expect(TODO_FILTERS).toEqual(["today", "future", "all", "completed"]);
    expect(TODO_SORT_OPTIONS).toEqual(["dueDate", "priority", "createdAt"]);
    expect(DEFAULT_CATEGORY_NAME).toBe("默认");
    expect(PRESET_CATEGORY_NAMES).toEqual(["默认", "工作", "生活", "学习", "购物"]);
  });

  it("supports the documented Todo and Category shapes", () => {
    const priority: TodoPriority = "medium";
    const filter: TodoFilter = "today";
    const todo: Todo = {
      id: "todo-1",
      title: "整理日程",
      note: "上午完成",
      dueDate: "2026-06-24T00:00:00.000Z",
      priority,
      category: "工作",
      completed: false,
      order: 1,
      createdAt: "2026-06-24T08:00:00.000Z",
      updatedAt: "2026-06-24T08:00:00.000Z",
    };
    const category: Category = {
      id: "category-1",
      name: "工作",
      createdAt: "2026-06-24T08:00:00.000Z",
      isSystem: true,
    };

    expect(filter).toBe("today");
    expect(todo.priority).toBe("medium");
    expect(category.name).toBe("工作");
  });
});
