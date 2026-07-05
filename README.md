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

```
冒险书/
├── backend/
│   ├── agent/
│   │   └── tools.js              # 工具注册表 + 参数校验 + prompt 生成
│   ├── routes/
│   │   ├── agent.js              # Agent 执行循环（SSE 流）
│   │   ├── tasks.js              # 任务 CRUD + 冲突检测 + 归档
│   │   ├── questBooks.js         # 任务书 CRUD
│   │   ├── notes.js              # 笔记 CRUD
│   │   ├── dayNotes.js           # 每日便签
│   │   └── dailyChecks.js        # 打卡追踪
│   ├── db.js                     # SQLite 数据层 + 迁移
│   └── server.js                 # Express 入口
├── website/
│   ├── index.html                # HTML 骨架
│   ├── css/styles.css            # 全部样式
│   ├── js/
│   │   ├── state.js              # 全局状态 + 常量
│   │   ├── i18n.js               # 中/英翻译 + SVG 图标
│   │   ├── utils.js              # 工具函数
│   │   ├── api.js                # REST API 封装
│   │   ├── render.js             # 通用渲染 + 任务行
│   │   ├── render-today.js       # Today 视图 + Dashboard
│   │   ├── render-questbook.js   # Quest Book 视图 + 时间轴引擎
│   │   ├── render-timeline.js    # Timeline 日历视图
│   │   ├── render-notes.js       # Journal 笔记视图
│   │   ├── editor.js             # 弹窗编辑器
│   │   ├── render-dialogue.js    # 安雅对话 + 表情引擎
│   │   └── app.js                # 事件委托 + 初始化
│   └── assets/                   # 图片/图标
└── package.json
```

## REST API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/tasks` | 列表 / 批量替换 |
| PUT/DELETE | `/tasks/:id` | 更新 / 删除 |
| PATCH | `/tasks/:id/toggle` | 切换完成 |
| PATCH | `/tasks/:id/archive` | 归档 |
| PATCH | `/tasks/:id/unarchive` | 取消归档 |
| GET | `/tasks/check-conflict` | 时间段冲突检测 |
| GET/POST | `/quest-books` | 列表 / 批量 |
| PATCH | `/quest-books/:b/s/:s/toggle` | 子任务 toggle |
| DELETE | `/quest-books/:b/s/:s` | 删除子任务 |
| PATCH | `/quest-books/:b/i/:i/toggle` | 独立任务 toggle |
| GET/POST | `/notes` | 列表 / 创建 |
| PUT/DELETE | `/notes/:id` | 更新 / 删除 |
| GET/PUT | `/day-notes/:date` | 每日便签 |
| POST | `/daily-checks/auto-reset` | 打卡重置 |
| PATCH | `/daily-checks/:id/:date/toggle` | 打卡 toggle |
| POST | `/agent/chat` | SSE 流 Agent 对话 |
| GET/PUT | `/agent/config` | API 配置 |
