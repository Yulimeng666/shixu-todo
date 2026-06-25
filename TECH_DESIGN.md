# 个人日程待办网站技术设计文档

## 1. 项目概述

项目是一个从零搭建的 React + TypeScript + Vite 前端应用，用于实现个人待办管理。第一版采用本地优先架构，数据保存在 IndexedDB，中期不引入后端服务。

本轮在原有任务模型基础上，引入全局分类体系，用于统一分类来源、左侧分类导航和工具栏筛选。

## 2. 产品目标与 MVP 范围

MVP 需要覆盖：

- 任务新增、编辑、删除、完成、取消完成
- 今天、未来、全部、已完成视图
- 开始日期、截止日期、优先级、分类、备注
- 搜索、筛选、排序
- IndexedDB 本地持久化
- 全局分类列表
- 左侧分类栏新增、删除、筛选

本轮不实现：

- 登录与同步
- 独立分类管理页
- 分类重命名
- 团队协作

## 3. 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Dexie.js / IndexedDB
- date-fns
- lucide-react
- Vitest + React Testing Library

## 4. 推荐项目结构

```text
.
├── docs/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   └── todos/
│   │       ├── components/
│   │       ├── db.ts
│   │       ├── store.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── lib/
│   ├── styles/
│   ├── test/
│   ├── types/
│   └── main.tsx
├── PRD.md
├── TECH_DESIGN.md
├── TASKS.md
└── AGENTS.md
```

## 5. 核心数据模型

### 5.1 TodoPriority

```ts
export type TodoPriority = "low" | "medium" | "high";
```

### 5.2 TodoFilter

```ts
export type TodoFilter = "today" | "future" | "all" | "completed";
```

### 5.3 Category

```ts
export type Category = {
  id: string;
  name: string;
  createdAt: string;
  isSystem: boolean;
};
```

### 5.4 Todo

```ts
export type Todo = {
  id: string;
  title: string;
  note?: string;
  startDate?: string;
  dueDate?: string;
  priority: TodoPriority;
  category: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

说明：

- `category` 存储分类名称
- 第一版不把任务分类改成外键形式，降低迁移复杂度
- 全局分类列表是分类名称的唯一来源

### 5.5 CreateTodoInput / UpdateTodoInput

```ts
export type CreateTodoInput = {
  title: string;
  note?: string;
  startDate?: string;
  dueDate?: string;
  priority?: TodoPriority;
  category?: string;
};

export type UpdateTodoInput = Partial<CreateTodoInput>;
```

### 5.6 预置分类

```ts
export const DEFAULT_CATEGORY_NAME = "默认";
export const PRESET_CATEGORY_NAMES = ["默认", "工作", "生活", "学习", "购物"] as const;
```

## 6. 数据管理方案

### 6.1 本地持久化路线

- Dexie 负责访问 IndexedDB
- Zustand 负责业务状态
- 启动时由 store 统一加载任务和分类
- 写入失败时回滚 optimistic state 并暴露错误

### 6.2 Dexie 表设计

- `todos`
- `categories`

推荐索引：

- `todos`: `id, title, startDate, dueDate, priority, category, completed, order, createdAt, updatedAt, completedAt`
- `categories`: `id, &name, createdAt, isSystem`

### 6.3 初始化与迁移策略

启动时执行一次初始化逻辑：

1. 读取 `todos` 和 `categories`
2. 若分类表缺少预置分类，则补齐：
   - `默认`
   - `工作`
   - `生活`
   - `学习`
   - `购物`
3. 若历史任务缺少分类，则将任务分类补为 `默认`
4. 若历史任务已有分类但分类表里不存在，则补建该分类
5. 将修正后的任务和分类回写本地库

### 6.4 Zustand 状态职责

`src/features/todos/store.ts` 负责：

- `todos`
- `categories`
- `filter`
- `searchQuery`
- `sortBy`
- `priorityFilter`
- `dateFilter`
- `completionFilter`
- `categoryFilter`
- `isLoading`
- `error`

建议方法：

```ts
initializeAppData();
loadTodos();
loadCategories();
createTodo(input);
updateTodo(id, patch);
deleteTodo(id);
toggleTodo(id);
createCategory(name);
deleteCategory(id);
setFilter(filter);
setSearchQuery(query);
setCategoryFilter(category);
```

### 6.5 分类业务规则

- `默认` 分类永久存在
- `默认` 分类不可删除
- 任务未选分类时自动归入 `默认`
- 分类名称需要 trim
- 分类名称不能为空
- 分类名称大小写不敏感去重
- 删除分类后，相关任务统一回收到 `默认`

### 6.6 视图语义

- `today` 仍基于 `dueDate`
- `future` 仍基于 `dueDate`
- `startDate` 只负责录入、存储、展示，不参与 today/future 主筛选

### 6.7 今天视图默认日期规则

- 当前视图为 `today` 且创建任务未填写 `dueDate` 时，提交前自动补今天日期
- 只对创建生效，不影响编辑

## 7. 页面与组件设计

### 7.1 核心组件

- `TodoWorkspace`
- `TodoSidebar`
- `MobileNav`
- `TodoToolbar`
- `TodoList`
- `TodoItem`
- `TodoEditor`
- `ConfirmDialog`

### 7.2 左侧分类栏

左侧分类区包含：

- 分类标题
- 标题右侧新增按钮
- 分类列表
- 删除按钮

行为：

- 点击分类后直接设置 `categoryFilter`
- 当前分类高亮
- 删除按钮只对非默认分类显示
- 删除前弹确认框

### 7.3 任务表单

分类字段行为：

- 使用全局分类下拉选择
- 默认值为 `默认`
- 不在表单内新增分类

## 8. 样式设计规范

- 整体风格为简洁效率型工具
- 左侧分类栏保持导航感，不做卡片堆叠
- 分类新增入口用小尺寸图标按钮
- 删除分类按钮弱化显示，仅在行内提供明确操作
- 优先保证信息扫描效率与点击稳定性

## 9. 后续同步架构

第一版不实现远程同步，但保留扩展空间：

- `Todo` 核心字段保持稳定
- `Category` 作为独立实体保留同步可能
- 后续引入 API 层时，不改当前 UI 和 store 主结构

## 10. 命令规范

```bash
npm run dev
npm run build
npm run test
```

## 11. 测试策略

### 11.1 数据层

- 分类表初始化
- 预置分类补齐
- 历史任务分类迁移
- 删除分类后的任务回收

### 11.2 状态层

- 分类加载
- 新增分类
- 删除分类
- 分类删除失败时状态回滚
- 左侧分类筛选与工具栏筛选共用状态

### 11.3 组件层

- 左侧分类栏展示预置分类
- 左侧新增分类后立即可见
- 点击分类后主列表筛选生效
- 删除分类后任务分类显示为 `默认`
- 任务表单分类默认值为 `默认`

### 11.4 回归

- 今天视图默认补截止日期
- 开始日期保存和展示
- 搜索、排序、完成状态不回退

## 12. 开发边界

- 第一版不做分类重命名
- 不新增独立分类页
- 不引入新状态库或 UI 框架
- 不添加分析、遥测和网络请求
- 继续保持本地优先实现

## 13. 暖色主题与分区规则补充

- 当前 UI 允许采用暖色调主题，但暖色只作为页面氛围和浅层容器底色。
- 布局分区必须依赖明确边框，而不是仅靠不同深浅的同色背景。
- 以下区域必须具备独立边界：
  - 左侧导航区
  - 顶部工具栏
  - 当前视图信息区
  - 任务列表主容器
- 任务卡片和主要内容容器优先保持高对比浅底，避免暖色覆盖过重导致信息层次模糊。
- 后续若继续调整主题，先检查区域识别速度和任务文本对比度，再决定是否扩大暖色面积。
