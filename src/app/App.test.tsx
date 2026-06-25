import "fake-indexeddb/auto";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useTodosStore } from "../features/todos/store";
import { DEFAULT_CATEGORY_NAME, type Category } from "../features/todos/types";
import { createTodo } from "../features/todos/utils";
import { App } from "./App";

const baseCategories: Category[] = [
  { id: "default", name: "默认", createdAt: "2026-06-24T08:00:00.000Z", isSystem: true },
  { id: "work", name: "工作", createdAt: "2026-06-24T08:00:00.000Z", isSystem: true },
  { id: "life", name: "生活", createdAt: "2026-06-24T08:00:00.000Z", isSystem: true },
  { id: "study", name: "学习", createdAt: "2026-06-24T08:00:00.000Z", isSystem: true },
  { id: "shopping", name: "购物", createdAt: "2026-06-24T08:00:00.000Z", isSystem: true },
];

describe("App layout", () => {
  beforeEach(() => {
    useTodosStore.setState({
      todos: [],
      categories: baseCategories,
      filter: "all",
      searchQuery: "",
      sortBy: "dueDate",
      priorityFilter: "all",
      dateFilter: "all",
      completionFilter: "all",
      categoryFilter: "all",
      isLoading: false,
      isHydrated: true,
      error: null,
    });
  });

  it("renders the todo workspace navigation, toolbar, and category area", () => {
    render(<App />);

    expect(screen.getByText("个人待办")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "今天" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "未来" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "全部" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "已完成" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "新增任务" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("searchbox", { name: "搜索任务" })).toBeInTheDocument();
    expect(screen.getByLabelText("筛选优先级")).toBeInTheDocument();
    expect(screen.getByLabelText("排序方式")).toBeInTheDocument();
    expect(screen.getByText("分类")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "筛选分类 默认" })).toBeInTheDocument();
  });

  it("creates and edits a todo from the editor", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "新增任务" })[0]);
    await user.type(screen.getByLabelText("标题"), "写阶段 7");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("写阶段 7")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "编辑 写阶段 7" }));
    const titleInput = await screen.findByLabelText("标题");
    await user.clear(titleInput);
    await user.type(titleInput, "完善阶段 7");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("完善阶段 7")).toBeInTheDocument();
    expect(screen.queryByText("写阶段 7")).not.toBeInTheDocument();
  });

  it("creates a todo in today view and shows it immediately when due date is omitted", async () => {
    const user = userEvent.setup();
    useTodosStore.setState({
      todos: [],
      categories: baseCategories,
      filter: "today",
      searchQuery: "",
      sortBy: "dueDate",
      priorityFilter: "all",
      dateFilter: "all",
      completionFilter: "all",
      categoryFilter: "all",
      isLoading: false,
      isHydrated: true,
      error: null,
    });

    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "新增任务" })[0]);
    await user.type(screen.getByLabelText("标题"), "今天新建任务");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("今天新建任务")).toBeInTheDocument();
    expect(screen.getByText(/截止 \d{4}-\d{2}-\d{2}/)).toBeInTheDocument();
  });

  it("supports global category add, filter, and delete with fallback to default", async () => {
    const user = userEvent.setup();
    const workTodo = createTodo(
      {
        title: "工作任务",
        priority: "high",
        category: "临时分类",
      },
      { id: "work", now: new Date("2026-06-24T08:00:00.000Z") },
    );

    useTodosStore.setState({
      todos: [workTodo],
      categories: [
        ...baseCategories,
        {
          id: "temp",
          name: "临时分类",
          createdAt: "2026-06-24T08:00:00.000Z",
          isSystem: false,
        },
      ],
      filter: "all",
      categoryFilter: "all",
      isHydrated: true,
      isLoading: false,
      error: null,
    });

    render(<App />);

    await user.click(screen.getByRole("button", { name: "新增分类" }));
    await user.type(screen.getByLabelText("分类名称"), "旅行");
    await user.click(screen.getByRole("button", { name: "确认新增分类" }));
    expect(screen.getByRole("button", { name: "筛选分类 旅行" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "筛选分类 临时分类" }));
    expect(screen.getByText("工作任务")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "删除分类 临时分类" }));
    expect(screen.getByRole("dialog", { name: "删除分类" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "删除分类" })).not.toBeInTheDocument();
    });

    expect(useTodosStore.getState().todos[0].category).toBe(DEFAULT_CATEGORY_NAME);
    expect(useTodosStore.getState().categoryFilter).toBe("all");
  });

  it("searches, filters, clears filters, and sorts todos from the toolbar", async () => {
    const user = userEvent.setup();
    const baseDate = new Date("2026-06-24T08:00:00.000Z");
    const workTodo = createTodo(
      {
        title: "工作周会",
        note: "同步项目风险",
        priority: "high",
        category: "工作",
        dueDate: "2026-06-24T00:00:00.000Z",
      },
      { id: "work", now: baseDate },
    );
    const studyTodo = createTodo(
      {
        title: "学习复盘",
        priority: "medium",
        category: "学习",
        dueDate: "2026-06-25T00:00:00.000Z",
      },
      { id: "study", now: new Date("2026-06-24T08:01:00.000Z") },
    );
    const lifeTodo = createTodo(
      {
        title: "生活采购",
        priority: "low",
        category: "生活",
      },
      { id: "life", now: new Date("2026-06-24T08:02:00.000Z") },
    );

    useTodosStore.setState({
      todos: [lifeTodo, studyTodo, workTodo],
      categories: baseCategories,
      filter: "all",
      searchQuery: "",
      sortBy: "dueDate",
      priorityFilter: "all",
      dateFilter: "all",
      completionFilter: "all",
      categoryFilter: "all",
      isLoading: false,
      isHydrated: true,
      error: null,
    });

    render(<App />);

    await user.type(screen.getByRole("searchbox", { name: "搜索任务" }), "风险");
    expect(screen.getByText("工作周会")).toBeInTheDocument();
    expect(screen.queryByText("学习复盘")).not.toBeInTheDocument();
    expect(screen.queryByText("生活采购")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: "搜索任务" }));
    await user.selectOptions(screen.getByLabelText("筛选优先级"), "high");
    expect(screen.getByText("工作周会")).toBeInTheDocument();
    expect(screen.queryByText("学习复盘")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("筛选分类"), "工作");
    expect(screen.getByText("工作周会")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getByText("学习复盘")).toBeInTheDocument();
    expect(screen.getByText("生活采购")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("排序方式"), "priority");
    expect(
      within(screen.getByRole("list"))
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["工作周会", "学习复盘", "生活采购"]);
  });

  it("shows loading, error, and filtered empty states", async () => {
    const user = userEvent.setup();
    const todo = createTodo(
      {
        title: "普通任务",
        priority: "low",
        category: "生活",
      },
      { id: "normal", now: new Date("2026-06-24T08:00:00.000Z") },
    );

    useTodosStore.setState({
      todos: [],
      categories: baseCategories,
      isLoading: true,
      isHydrated: true,
      error: null,
    });

    const { rerender } = render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("正在加载任务");

    useTodosStore.setState({
      todos: [todo],
      categories: baseCategories,
      isLoading: false,
      isHydrated: true,
      error: "读取本地数据失败",
      filter: "all",
      priorityFilter: "all",
      dateFilter: "all",
      completionFilter: "all",
      categoryFilter: "all",
    });
    rerender(<App />);

    expect(screen.getByRole("alert")).toHaveTextContent("读取本地数据失败");
    await user.click(screen.getByRole("button", { name: "关闭错误提示" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("筛选优先级"), "high");
    expect(screen.getByRole("status")).toHaveTextContent("没有匹配的任务");
    expect(screen.getByRole("status")).toHaveTextContent("调整搜索词或筛选条件后再试。");
  });
});
