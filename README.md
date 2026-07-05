# Adventure Journal（冒险书）

> 羊皮纸复古风格的全栈桌面任务管理应用。搭载自建 AI Agent 引擎（10 工具注册表 + 多轮执行循环 + 原生 function calling）

---

## 快速开始

```bash
git clone https://github.com/ziki0621/Adventure-Journal.git
cd Adventure-Journal
npm install
npm run dev
```

打开 `http://127.0.0.1:4173/` → 设置 → AI Agent API → 配置 LLM 接口即可启用安雅 AI。

## 架构

```
browser ─── fetch /api/* ─── Express ─── sql.js (WASM) ─── SQLite
                │
                └── POST /api/agent/chat (SSE) ─── LLM API ← service-side API key
```

- **前端**: Vanilla JS（12 模块）、CSS3、零框架
- **后端**: Node.js + Express + SQLite（sql.js）
- **AI Agent**: OpenAI 兼容 function calling、自动降级 JSON 解析

## 五视图工作台

| 视图 | 功能 |
|------|------|
| **Today** | 微型日历 + 系统仪表盘 + 已安排 / 未设定双列任务面板 + 便签 |
| **Quest Book** | 三级任务层级 + 动画时间轴 + 单任务编辑弹窗 + 时间段 |
| **Daily** | 打卡追踪（daily_checks 表） + 逾期自动标记为 `missed` |
| **Side** | 一次性支线任务 + 归档管理 |
| **Journal** | 笔记卡片网格 + 新建/编辑/删除 + 导出 JSON |

## AI Agent

- **10 工具**: createTask（返回草稿）、deleteTask、listTasks、getTaskStats、searchNotes、updateTask、toggleTask、updateTaskDesc、createNote、listQuestBooks
- **执行循环**: 最多 5 轮迭代，工具结果回注对话上下文
- **原生 function calling**: 支持 OpenAI `tool_calls`，不支持的 API 自动降级为文本 JSON 解析
- **参数校验**: `validateAndCoerceParams()` 检查 required / enum / type
- **草稿确认**: createTask 只返回 draft 不写库，用户必须在编辑器确认
- **快捷按钮**: 安排任务 / 今日简报 / 快速笔记 / 闲聊
- **表情系统**: 7 个安雅表情根据对话内容自动切换
- **主动提醒**: 任务时间段即将到达时弹出悬浮气泡

## 数据模型

```
tasks (daily | side)
  ├── daily  → daily_checks (date, status)
  └── side   → completed / archived

quest_books → quest_lines → subtasks
                          → independent_quests
notes
day_notes
agent_messages / agent_config
```

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
