import { describe, expect, it, vi } from "vitest";
import type { CategoryRepository, TodoRepository } from "./db";
import { createTodosStore, selectVisibleTodos } from "./store";
import { DEFAULT_CATEGORY_NAME, PRESET_CATEGORY_NAMES, type Category, type Todo } from "./types";
import { createTodo } from "./utils";

const baseDate = new Date("2026-06-24T08:00:00.000Z");

function makeTodo(id: string, title: string, overrides: Partial<Todo> = {}): Todo {
  return {
    ...createTodo(
      {
        title,
        priority: overrides.priority ?? "medium",
        category: overrides.category ?? DEFAULT_CATEGORY_NAME,
      },
      { id, now: baseDate },
    ),
    ...overrides,
  };
}

function makeCategory(name: string, patch: Partial<Category> = {}): Category {
  return {
    id: patch.id ?? `category-${name}`,
    name,
    createdAt: patch.createdAt ?? "2026-06-24T08:00:00.000Z",
    isSystem:
      patch.isSystem ??
      PRESET_CATEGORY_NAMES.includes(name as (typeof PRESET_CATEGORY_NAMES)[number]),
  };
}

function createRepository(initialTodos: Todo[] = []): TodoRepository {
  let todos = [...initialTodos];

  return {
    getAll: vi.fn(async () => [...todos]),
    getById: vi.fn(async (id: string) => todos.find((todo) => todo.id === id)),
    create: vi.fn(async (todo: Todo) => {
      todos = [...todos, todo];
      return todo;
    }),
    update: vi.fn(async (todo: Todo) => {
      const index = todos.findIndex((item) => item.id === todo.id);
      if (index === -1) {
        throw new Error("待办不存在，无法更新");
      }
      todos = todos.map((item) => (item.id === todo.id ? todo : item));
      return todo;
    }),
    bulkUpsert: vi.fn(async (nextTodos: Todo[]) => {
      const map = new Map(todos.map((todo) => [todo.id, todo] as const));
      for (const todo of nextTodos) {
        map.set(todo.id, todo);
      }
      todos = Array.from(map.values());
      return nextTodos;
    }),
    delete: vi.fn(async (id: string) => {
      todos = todos.filter((todo) => todo.id !== id);
    }),
  };
}

function createCategoryRepo(initialCategories: Category[] = []): CategoryRepository {
  let categories = [...initialCategories];

  return {
    getAll: vi.fn(async () => [...categories]),
    create: vi.fn(async (category: Category) => {
      categories = [...categories, category];
      return category;
    }),
    bulkUpsert: vi.fn(async (nextCategories: Category[]) => {
      const map = new Map(categories.map((category) => [category.id, category] as const));
      for (const category of nextCategories) {
        map.set(category.id, category);
      }
      categories = Array.from(map.values());
      return nextCategories;
    }),
    delete: vi.fn(async (id: string) => {
      categories = categories.filter((category) => category.id !== id);
    }),
  };
}

describe("todos store", () => {
  it("initializes preset categories and normalizes uncategorized todos", async () => {
    const todo = makeTodo("todo-1", "读取任务", { category: undefined });
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([]);
    const store = createTodosStore(repository, categoryRepository);

    await store.getState().initializeAppData();

    expect(store.getState().isHydrated).toBe(true);
    expect(store.getState().todos[0].category).toBe(DEFAULT_CATEGORY_NAME);
    expect(store.getState().categories.map((item) => item.name)).toEqual([
      "默认",
      "工作",
      "购物",
      "生活",
      "学习",
    ]);
    expect(repository.bulkUpsert).toHaveBeenCalled();
    expect(categoryRepository.bulkUpsert).toHaveBeenCalled();
  });

  it("creates todos with default category and persists them through repository", async () => {
    const repository = createRepository();
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    const store = createTodosStore(repository, categoryRepository);

    const created = await store.getState().createTodo({ title: "  新任务  ", category: "   " });

    expect(created.title).toBe("新任务");
    expect(created.category).toBe(DEFAULT_CATEGORY_NAME);
    expect(store.getState().todos).toEqual([created]);
    expect(repository.create).toHaveBeenCalledWith(created);
  });

  it("updates todos and persists normalized values", async () => {
    const todo = makeTodo("todo-1", "旧标题");
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ todos: [todo] });

    const updated = await store
      .getState()
      .updateTodo("todo-1", { title: "  新标题  ", category: "  工作  " });

    expect(updated.title).toBe("新标题");
    expect(updated.category).toBe("工作");
    expect(store.getState().todos[0]).toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith(updated);
  });

  it("rolls back optimistic update when repository write fails", async () => {
    const todo = makeTodo("todo-1", "旧标题");
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    vi.mocked(repository.update).mockRejectedValueOnce(new Error("更新失败"));
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ todos: [todo] });

    await expect(store.getState().updateTodo("todo-1", { title: "新标题" })).rejects.toThrow(
      "更新失败",
    );

    expect(store.getState().todos).toEqual([todo]);
    expect(store.getState().error).toBe("更新失败");
  });

  it("deletes todos from state and repository", async () => {
    const todo = makeTodo("todo-1", "待删除");
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ todos: [todo] });

    await store.getState().deleteTodo("todo-1");

    expect(store.getState().todos).toEqual([]);
    expect(repository.delete).toHaveBeenCalledWith("todo-1");
  });

  it("toggles completion and persists the changed todo", async () => {
    const todo = makeTodo("todo-1", "完成任务");
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ todos: [todo] });

    const completed = await store.getState().toggleTodo("todo-1");
    expect(completed.completed).toBe(true);
    expect(completed.completedAt).toBeDefined();

    const reopened = await store.getState().toggleTodo("todo-1");
    expect(reopened.completed).toBe(false);
    expect(reopened.completedAt).toBeUndefined();
    expect(repository.update).toHaveBeenCalledTimes(2);
  });

  it("creates categories and rejects duplicates", async () => {
    const repository = createRepository();
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME)]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ categories: [makeCategory(DEFAULT_CATEGORY_NAME)] });

    const created = await store.getState().createCategory("工作");
    expect(created.name).toBe("工作");
    expect(store.getState().categories.some((item) => item.name === "工作")).toBe(true);

    await expect(store.getState().createCategory("  工作  ")).rejects.toThrow("分类名称已存在");
  });

  it("deletes categories and reassigns related todos to default", async () => {
    const workCategory = makeCategory("工作", { isSystem: false });
    const todo = makeTodo("todo-1", "工作任务", { category: "工作" });
    const repository = createRepository([todo]);
    const categoryRepository = createCategoryRepo([makeCategory(DEFAULT_CATEGORY_NAME), workCategory]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({
      todos: [todo],
      categories: [makeCategory(DEFAULT_CATEGORY_NAME), workCategory],
      categoryFilter: "工作",
    });

    await store.getState().deleteCategory(workCategory.id);

    expect(store.getState().todos[0].category).toBe(DEFAULT_CATEGORY_NAME);
    expect(store.getState().categories.some((item) => item.id === workCategory.id)).toBe(false);
    expect(store.getState().categoryFilter).toBe("all");
    expect(repository.bulkUpsert).toHaveBeenCalled();
    expect(categoryRepository.delete).toHaveBeenCalledWith(workCategory.id);
  });

  it("does not allow deleting the default category", async () => {
    const defaultCategory = makeCategory(DEFAULT_CATEGORY_NAME);
    const repository = createRepository();
    const categoryRepository = createCategoryRepo([defaultCategory]);
    const store = createTodosStore(repository, categoryRepository);
    store.setState({ categories: [defaultCategory] });

    await expect(store.getState().deleteCategory(defaultCategory.id)).rejects.toThrow(
      "默认分类不可删除",
    );
  });

  it("stores filter, search, and sort state", () => {
    const store = createTodosStore(createRepository(), createCategoryRepo());

    store.getState().setFilter("completed");
    store.getState().setSearchQuery("周会");
    store.getState().setSortBy("priority");
    store.getState().setPriorityFilter("high");
    store.getState().setDateFilter("today");
    store.getState().setCompletionFilter("active");
    store.getState().setCategoryFilter("工作");

    expect(store.getState().filter).toBe("completed");
    expect(store.getState().searchQuery).toBe("周会");
    expect(store.getState().sortBy).toBe("priority");
    expect(store.getState().priorityFilter).toBe("high");
    expect(store.getState().dateFilter).toBe("today");
    expect(store.getState().completionFilter).toBe("active");
    expect(store.getState().categoryFilter).toBe("工作");

    store.getState().clearAdvancedFilters();

    expect(store.getState().priorityFilter).toBe("all");
    expect(store.getState().dateFilter).toBe("all");
    expect(store.getState().completionFilter).toBe("all");
    expect(store.getState().categoryFilter).toBe("all");
  });

  it("selects visible todos with advanced filters", () => {
    const workTodo = {
      ...makeTodo("work", "工作任务", { priority: "high" }),
      dueDate: "2026-06-24T00:00:00.000Z",
      category: "工作",
    };
    const lifeTodo = {
      ...makeTodo("life", "生活任务", { priority: "low" }),
      category: "生活",
    };
    const store = createTodosStore(createRepository([workTodo, lifeTodo]), createCategoryRepo());
    store.setState({
      todos: [lifeTodo, workTodo],
      filter: "all",
      priorityFilter: "high",
      dateFilter: "today",
      completionFilter: "active",
      categoryFilter: "工作",
    });

    expect(
      selectVisibleTodos(store.getState(), new Date("2026-06-24T09:00:00.000Z")).map(
        (todo) => todo.id,
      ),
    ).toEqual(["work"]);
  });
});
