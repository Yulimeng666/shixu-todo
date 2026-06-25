import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  createCategoryRepository,
  createTodoDatabase,
  createTodoRepository,
  type TodoDatabase,
} from "./db";
import { DEFAULT_CATEGORY_NAME } from "./types";
import { createTodo } from "./utils";

describe("todo database", () => {
  let database: TodoDatabase | undefined;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
      database = undefined;
    }
  });

  async function setupRepositories() {
    database = createTodoDatabase(`TodoTestDatabase-${crypto.randomUUID()}`);
    await database.open();

    return {
      todoRepository: createTodoRepository(database),
      categoryRepository: createCategoryRepository(database),
    };
  }

  it("creates and loads todos through the repository", async () => {
    const { todoRepository } = await setupRepositories();
    const first = createTodo(
      { title: "编写阶段 3", priority: "high", startDate: "2026-06-24" },
      { id: "todo-1", now: new Date("2026-06-24T08:00:00.000Z") },
    );
    const second = createTodo(
      { title: "检查测试", category: DEFAULT_CATEGORY_NAME },
      { id: "todo-2", now: new Date("2026-06-24T09:00:00.000Z") },
    );

    await todoRepository.create(first);
    await todoRepository.create(second);

    expect(await todoRepository.getAll()).toEqual([first, second]);
    expect(await todoRepository.getById("todo-1")).toEqual(first);
    expect((await todoRepository.getById("todo-1"))?.startDate).toBe("2026-06-24");
  });

  it("updates an existing todo and returns the updated value", async () => {
    const { todoRepository } = await setupRepositories();
    const original = createTodo(
      { title: "旧标题" },
      { id: "todo-update", now: new Date("2026-06-24T08:00:00.000Z") },
    );
    await todoRepository.create(original);

    const updated = await todoRepository.update({
      ...original,
      title: "新标题",
      startDate: "2026-06-25",
      updatedAt: "2026-06-24T10:00:00.000Z",
    });

    expect(updated.title).toBe("新标题");
    expect(updated.startDate).toBe("2026-06-25");
    expect(await todoRepository.getById("todo-update")).toEqual(updated);
  });

  it("throws when updating a missing todo", async () => {
    const { todoRepository } = await setupRepositories();
    const missing = createTodo(
      { title: "不存在" },
      { id: "todo-missing", now: new Date("2026-06-24T08:00:00.000Z") },
    );

    await expect(todoRepository.update(missing)).rejects.toThrow("待办不存在，无法更新");
  });

  it("creates and deletes categories through the repository", async () => {
    const { categoryRepository } = await setupRepositories();
    const category = {
      id: "category-1",
      name: "工作",
      createdAt: "2026-06-24T08:00:00.000Z",
      isSystem: true,
    };

    await categoryRepository.create(category);
    expect(await categoryRepository.getAll()).toEqual([category]);

    await categoryRepository.delete("category-1");
    expect(await categoryRepository.getAll()).toEqual([]);
  });
});
