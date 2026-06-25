# 开发任务顺序

本文件定义个人日程待办网站的功能模块开发顺序。每次开发前必须先阅读 `PRD.md`、`TECH_DESIGN.md`、`AGENTS.md` 和本文件。

## 1. 执行原则

- 按阶段顺序推进，避免返工
- 每个阶段完成后运行对应验证命令
- 若需求变更影响产品、技术或规范，先更新文档再改代码

## 2. 阶段 1 - 11（已完成）

- 项目结构整理
- Todo 类型与工具函数
- Dexie / IndexedDB 数据层
- Zustand 状态层
- 基础布局与导航
- 任务列表与任务项
- 新增/编辑任务表单
- 删除确认与完成状态
- 搜索、筛选、排序
- 空状态、错误状态、响应式打磨
- 测试与最终验收

## 3. 阶段 12：全局分类体系与左侧分类栏

### 目标

- 将分类从任务聚合方案升级为全局分类体系
- 在左侧分类栏提供新增、删除、筛选能力
- 保留 `默认` 分类并作为任务未选分类时的回退值

### 涉及模块

- `src/features/todos/types.ts`
- `src/features/todos/db.ts`
- `src/features/todos/store.ts`
- `src/features/todos/components/TodoNavigation.tsx`
- `src/features/todos/components/TodoToolbar.tsx`
- `src/features/todos/components/TodoEditor.tsx`
- `src/features/todos/components/TodoWorkspace.tsx`

### 验收标准

- 系统预置分类：`默认`、`工作`、`生活`、`学习`、`购物`
- 左侧分类栏显示分类列表与数量
- 左侧分类栏可新增分类，并立即用于任务表单和筛选
- 左侧分类栏可删除非默认分类
- 删除分类后，相关任务自动归入 `默认`
- 点击左侧分类后，任务列表立即按该分类筛选
- 工具栏分类筛选与左侧分类点击保持同步
- 新建任务未选分类时，自动归入 `默认`
- 表单内不再直接新增分类

### 验证命令

```bash
npm run test -- --run
npm run build
```
