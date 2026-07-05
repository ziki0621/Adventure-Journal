# Adventure Journal（冒险书）

一个带 AI Agent 能力的个人事务管理产品原型，灵感来源于RPG冒险游戏。

相比较于一般的Todo应用，它尝试把「长期目标、重复习惯、一次性任务、每日记录」重新组织成更适合个人执行的结构：任务书、日常、支线、笔记。而内置的AI Agent“冒险向导”安雅，负责把用户的自然语言意图转成可执行的任务操作。

---

## 项目定位

Adventure Journal 面向任务和目标都比较碎的人：学生、实习生、创作者、自由职业者，或者任何同时需要管理长期计划、日常习惯和临时事项的人。

普通 Todo App 的问题是：它通常只提供一个线性列表。用户可以记录任务，但很难维护任务之间的层级、周期、上下文和进展。Adventure Journal 用 RPG 式的信息架构重新组织任务，让用户更容易知道：

- 今天具体要做什么
- 哪些任务属于长期目标
- 哪些事情是每天重复维护的习惯
- 哪些只是一次性的支线事项
- 哪些笔记可以作为任务上下文被重新调用

## 核心体验

| 模块 | 产品含义 | 主要能力 |
| --- | --- | --- |
| Today | 每日执行面板 | 日历、今日任务、逾期任务、任务备注及随笔便签 |
| Quest Book | 长期目标管理 | 任务书、任务线、子任务、独立任务、起止日期、时间轴 |
| Daily | 重复习惯 | 每日打卡、自动重置、missed 状态、连续记录 |
| Side | 一次性任务 | 临时事项、完成状态、归档 |
| Journal | 上下文笔记 | 笔记创建、搜索、编辑、导出 |
| Anya AI | AI Agent 助手 | 对话式创建任务、查询任务、更新任务、搜索笔记、今日简报 |

## AI Agent 做了什么

Anya AI 是项目中的内置 Agent。它不是只返回聊天文本，而是可以通过工具调用操作本地任务系统。

典型流程：

```text
用户：帮我明天下午三点安排复习产品经理面试
        ↓
LLM 判断需要创建任务
        ↓
调用 createTask 工具，生成结构化草稿
        ↓
前端弹出任务编辑器
        ↓
用户确认后才写入数据库
```

这个设计刻意保留了「用户确认」步骤：AI 负责理解和转译意图，最终写入仍由用户确认，避免误操作直接污染任务数据。

### Agent 能力

- OpenAI 兼容 function calling：支持标准 `tools` / `tool_choice` / `tool_calls`
- 兼容降级：当模型或接口不支持工具调用时，降级为文本 JSON 工具解析
- 多轮工具执行循环：最多 5 轮调用，工具结果会回注到对话上下文
- 工具参数校验：`validateAndCoerceParams()` 校验 required、enum、type
- SSE 流式响应：前端通过 `/api/agent/chat` 接收工具结果和最终回复
- 本地数据工具：任务、笔记、统计、任务书查询等能力通过工具注册表暴露

当前工具列表：

| 工具 | 用途 |
| --- | --- |
| `createTask` | 生成任务草稿，等待用户确认 |
| `updateTask` | 更新任务标题、日期、描述、时间段 |
| `deleteTask` | 删除任务 |
| `toggleTask` | 切换任务完成状态 |
| `listTasks` | 按类型、日期状态查询任务 |
| `getTaskStats` | 获取任务统计 |
| `updateTaskDesc` | 更新任务描述 |
| `createNote` | 创建笔记 |
| `searchNotes` | 搜索笔记 |
| `listQuestBooks` | 查询任务书结构 |

## 信息架构设计

Adventure Journal 没有把所有事项都放进一个列表，而是把任务拆成四类对象：

- **任务书（Quest Book）**：承载长期目标，例如一个项目、课程、作品集准备。任务书可以包含任务线、子任务和独立任务。
- **日常（Daily）**：承载重复习惯，例如每天背单词、复盘、运动。它们完成后不会消失，而是进入每日打卡记录。
- **支线（Side）**：承载一次性任务，例如买东西、交材料、临时安排。完成后可以归档。
- **笔记（Journal）**：承载上下文、想法和记录，让 AI 可以通过搜索笔记辅助用户找回信息。

这样的结构让产品不只是「记任务」，而是在帮助用户维护一个可执行的个人系统。

## 技术实现

```text
Browser
  ├─ static frontend: Vanilla JS + CSS
  └─ fetch /api/*
        ↓
Node.js + Express
  ├─ REST API: tasks / quest-books / notes / day-notes / daily-checks
  ├─ Agent API: /api/agent/chat
  └─ sql.js + SQLite file
        ↓
Local data store
```

### 前端

- Vanilla JavaScript，按视图和职责拆分模块
- 自定义复古羊皮纸视觉系统
- Today、Quest Book、Daily、Side、Timeline、Journal 多视图工作台
- 弹窗编辑器、任务书子项编辑、AI 对话窗口、SSE 流式渲染

### 后端

- Node.js + Express
- sql.js 持久化 SQLite 数据
- REST API 管理任务、任务书、笔记、每日便签和打卡状态
- Agent 路由统一处理 LLM 请求、工具调用、结果回注和流式返回

## 数据模型

```text
tasks
  ├─ daily tasks → daily_checks
  └─ side tasks  → completed / archived

quest_books
  ├─ quest_lines
  │   └─ subtasks
  └─ independent_quests

notes
day_notes
agent_messages
agent_config
```

## 快速开始

```bash
git clone https://github.com/ziki0621/Adventure-Journal.git
cd Adventure-Journal
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:4173/
```

如需启用 AI Agent：

1. 打开应用右下角「设置」
2. 填入 OpenAI 兼容接口地址、API Key、模型名
3. 打开 Anya AI 对话窗口
4. 输入自然语言任务请求

## 项目结构

```text
backend/
  agent/
    tools.js              # 工具注册表、参数校验、system prompt
  routes/
    agent.js              # Agent 执行循环与 SSE 返回
    tasks.js              # 任务 CRUD、归档、冲突检测
    questBooks.js         # 任务书 CRUD
    notes.js              # 笔记 CRUD
    dayNotes.js           # 每日便签
    dailyChecks.js        # 日常打卡
  db.js                   # SQLite 数据层与迁移
  server.js               # Express 入口

website/
  index.html
  css/styles.css
  js/
    state.js
    api.js
    render.js
    render-today.js
    render-questbook.js
    render-timeline.js
    render-notes.js
    render-dialogue.js
    editor.js
    app.js
  assets/
```

## 项目亮点

- 把 AI Agent 嵌入具体任务管理流程，而不是停留在聊天演示
- 使用 function calling 让模型通过工具操作结构化数据
- createTask 采用草稿确认机制，平衡 AI 自动化和用户控制
- 用任务书、日常、支线、笔记重新设计个人任务管理的信息架构
- 前后端、数据层、Agent 执行循环均为本项目自建实现

## 当前边界

这个项目目前是本地优先的产品原型，不是多人协作 SaaS，也不是完全自主执行的长期后台 Agent。Agent 的主要价值在于理解用户意图、调用工具、生成结构化操作，并把结果交还给用户确认。

后续可以继续扩展：

- 让 AI 支持任务书拆解和计划生成
- 增加基于笔记和历史任务的长期记忆
- 增加更完整的 Agent 操作审计日志
- 增加云同步和多端使用
- 为作品集补充 demo 视频和产品说明页
