import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CATEGORY_NAME, type Todo } from "../types";
import { TodoEditor } from "./TodoEditor";

describe("TodoEditor", () => {
  it("validates required title before saving", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TodoEditor mode="create" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("任务标题不能为空")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed create input with default category selection", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TodoEditor
        mode="create"
        categories={["默认", "工作", "学习"]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("标题"), "  写阶段 18  ");
    await user.type(screen.getByLabelText("备注"), "补齐新需求");
    await user.type(screen.getByLabelText("开始日期"), "2026-06-25");
    await user.type(screen.getByLabelText("截止日期"), "2026-06-26");
    await user.selectOptions(screen.getByLabelText("优先级"), "high");
    await user.selectOptions(screen.getByLabelText("分类"), "工作");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "写阶段 18",
      note: "补齐新需求",
      startDate: "2026-06-25",
      dueDate: "2026-06-26",
      priority: "high",
      category: "工作",
    });
  });

  it("prefills edit values and defaults category to default when none is provided", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TodoEditor
        mode="edit"
        todo={createTodoFixture({ category: undefined })}
        categories={["默认", "工作", "生活"]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("标题")).toHaveValue("整理需求");
    expect(screen.getByLabelText("开始日期")).toHaveValue("2026-06-25");
    expect(screen.getByLabelText("分类")).toHaveValue(DEFAULT_CATEGORY_NAME);

    await user.clear(screen.getByLabelText("标题"));
    await user.type(screen.getByLabelText("标题"), "整理 PRD");
    await user.selectOptions(screen.getByLabelText("分类"), "工作");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "整理 PRD",
      note: "确认字段",
      startDate: "2026-06-25",
      dueDate: "2026-06-26",
      priority: "medium",
      category: "工作",
    });
  });
});

function createTodoFixture(patch: Partial<Todo> = {}): Todo {
  return {
    id: "todo-1",
    title: "整理需求",
    note: "确认字段",
    startDate: "2026-06-25",
    dueDate: "2026-06-26",
    priority: "medium",
    category: "产品",
    completed: false,
    order: 0,
    createdAt: "2026-06-25T08:00:00.000Z",
    updatedAt: "2026-06-25T08:00:00.000Z",
    ...patch,
  };
}
