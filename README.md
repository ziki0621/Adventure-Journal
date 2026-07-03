# Adventure Ledger（冒险书）

一款羊皮纸复古风格的桌面任务管理应用。前端为纯 HTML/CSS/JS 单文件（6300+ 行），后端为 Node.js + Express + SQLite。打包为 Windows `.exe` 桌面应用。

---

## 技术架构

```
┌─────────────────────────────────────────────┐
│                  前端                        │
│        website/index.html (6300+ 行)         │
│          vanilla HTML/CSS/JS                │
└──────────────┬──────────────────────────────┘
               │ fetch /api/*
┌──────────────┴──────────────────────────────┐
│              后端 API (Express)              │
│   backend/server.js + 5 个路由模块            │
└──────────────┬──────────────────────────────┘
               │ sql.js (WebAssembly)
┌──────────────┴──────────────────────────────┐
│           SQLite (data/adventure.db)        │
│     9 张表：tasks / quest_books / notes /    │
│     day_notes / agent_* / …                 │
└─────────────────────────────────────────────┘
```

**可选包装**：Electron → 打包为 `.exe` 桌面应用

---

## 功能总览

### 1. 侧边栏导航

- 点击左上角汉堡菜单按钮（☰），侧边栏从左侧滑入覆盖
- 6 个主要入口：Today / Quest Book / Daily / Side / Timeline / Journal
- 每项右上角显示未完成任务数
- 侧边栏底部显示一句随机名言 + 设置入口
- 点击遮罩层或选择页面后自动关闭

### 2. Today（今日）

**左侧 Dashboard**：
- 系统状态仪表：任务总数 / 待执行 / 已完成 / 完成度进度条
- 安雅头像卡片：点击图标唤起 AI 向导
- 每日便签（Sticky Note）：胶带便签风格，可自由书写，数据与日历同步

**右侧档案夹区域**：
- 四个任务过滤标签页：全部 / 任务书 / 日常 / 支线
- 逾期待办 → 今日截止 → 未来 7 天，按日期优先级排列
- 任务书子任务仅到期当日显示

**快捷添加栏**：
- 标题输入框 + 类型选择 + 日期选择 + 优先级选择 + 添加按钮
- 一键快速创建 daily 或 side 任务

### 3. Quest Book（任务书）— 三级层级

```
任务书（一级：有独立名称的大容器）
├── 任务线 A          ← 二级：可折叠标题组
│   ├── 子任务 1      ← 三级：可完成/删除
│   └── 子任务 2
├── 任务线 B
└── 独立任务          ← 二级：简单的一次性任务，无子任务
```

**视图页面**：
- 按任务书分组，每本书一张可展开卡片
- 卡片头显示书名、书本图标、任务统计（绿色圆点 = 进行中、灰色圆点 = 已完成）
- 展开后：任务线按组显示子任务列表 + 独立任务区
- 每个子任务/独立任务有 checkbox、截止日期、删除按钮
- 点击「管理任务线」按钮进入批量编辑器

**创建/编辑（弹窗编辑器）**：
- 任务书名称
- 任务线区：每条任务线有标题输入 + 可选子任务行（标题 + 日期 + 删除）
- 独立任务区：标题 + 日期 + 优先级 + 删除
- "＋添加任务线" 和 "＋添加子任务" 按钮
- 所有层级在一页内完成

### 4. Daily & Side（日常 & 支线）

- 和 Today 类似的标签页过滤（全部 / 进行中 / 归档）
- 统计面板：总数 / 进行中 / 已完成 / 高优先
- Daily 特有字段：周期（每日 / 每周 / 自定义）、开始/结束日期、连续打卡 streak
- Side 为一次性独立任务

**任务编辑器**（所有类型共用）：
| 字段 | Quest Book | Daily | Side |
|---|---|---|---|
| 标题 | ✓ | ✓ | ✓ |
| 截止日期 | ✓ | ✗ | ✓ |
| 优先级 | ✓ | ✓ | ✓ |
| 任务线 | ✓ | auto | auto |
| 周期 | ✗ | ✓ | ✗ |
| 开始/结束日期 | ✗ | ✓ | ✗ |
| 备注 | ✓ | ✓ | ✓ |

### 5. Timeline（时间线 / 日历）

- 完整月视图日历（42 格，含跨月日期）
- 月份导航箭头 +「今天」按钮
- 日历格子内用彩色圆点指示任务密度：
  - 墨色 = questbook
  - 绿色 = daily
  - 黄铜色 = side
  - 超过 3 个任务显示 "+N"
- 点击任意日期，下方显示该日任务列表
- 日期类型过滤标签：全部 / 任务书 / 日常 / 支线
- 日历下方：每日便签（和 Today 便签共享数据）

### 6. Journal（手记 / 笔记）

**知识库标签页**：
- 卡片网格展示所有已保存的笔记
- 每张卡片：日期、标题、编辑/删除按钮
- 点击卡片 → 弹出编辑窗口
- 「+ 新建笔记」按钮

**冒险日记标签页**：
- 左侧：快速记录便签（自动保存草稿，刷新不丢）
- 右侧：每日日记编辑器
  - 日期左右箭头 → 浏览不同日期
  - 系统时间 + 天气参数行
  - 大文本框 + 字数统计
  - 「写入档案」按钮
  - 下方「过往日记」列表：点击任一历史条目跳转到该日期
- 日记自动以 "YYYY-MM-DD 日记" 为标题存入数据库

### 7. 安雅 AI 向导

**入口**：Today 面板左侧安雅头像卡片

**对话视图**：
- 开场三段介绍式对话，逐字打字机效果
- 最后一句出现选项按钮：「需要导览」/「我自己看看」
- 输入框 + 发送按钮，对话气泡

**LLM 集成**：
- 多轮澄清式对话创建任务：安雅会一步步收集信息（标题 / 类型 / 优先级 / 频率），信息够了才用 JSON 指令创建
- SSE streaming 流式显示回复
- 回复中的 JSON 自动从屏幕中移除
- System prompt 确保安雅不直接创建任务，而是通过对话收集信息
- 创建任务后自动弹出编辑器，预填全部字段，用户可直接修改保存
- API 配置：Settings → AI Agent API（API Base URL / Key / Model）

**状态指示灯**：
- ● ONLINE（绿色呼吸）：API 已配置
- ● THINKING（黄铜色快闪）：正在调用 API
- ● OFFLINE（灰色常亮）：未配置 API，使用本地规则

### 8. 全局特性

- **翻页动画**：视图切换时 3D 翻页效果（`rotateY` transform）
- **羊皮纸纹理**：SVG 分形噪声 + CSS 渐变实现，零图片依赖
- **切角按钮**：`clip-path` 8 边形按钮，hover 阴影 + active 压入
- **空心菱形**：所有 Section Title 装饰用空心菱形
- **表单焦点态**：底部墨水线从中心向两侧展开
- **复选框动画**：SVG 路径 stroke 描边动画
- **移动端适配**：≤760px 底部导航栏 + overlay 侧边栏
- **双语切换**：中文 / English（设置页切换）

---

## 数据存储

| 数据类型 | 存储位置 | 格式 |
|---|---|---|
| 任务 (daily/side) | SQLite → tasks 表 | 行记录 |
| 任务书 | SQLite → quest_books / quest_lines / subtasks / independent_quests | 多表关联 |
| 笔记 | SQLite → notes 表 | 行记录 |
| 每日便签 | SQLite → day_notes 表 | date + content |
| 安雅对话 | SQLite → agent_messages 表 | role + text |
| API 配置 | SQLite → agent_config 表 | api_base / api_key / model |
| 快速记录草稿 | localStorage | `adventure-scratchpad-v1` |
| 日记草稿 | localStorage | `adventure-diary-draft` |
| 语言设置 | localStorage | `adventure-ledger-language` |

---

## REST API

Base URL: `http://127.0.0.1:4173/api`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/tasks` | 获取所有任务 |
| POST | `/tasks` | 创建任务（支持单条或批量） |
| PUT | `/tasks/:id` | 更新任务 |
| DELETE | `/tasks/:id` | 删除任务 |
| PATCH | `/tasks/:id/toggle` | 切换完成状态 |
| GET | `/quest-books` | 获取所有任务书 |
| POST | `/quest-books` | 创建任务书（含嵌套数据） |
| PUT | `/quest-books/:id` | 更新任务书 |
| DELETE | `/quest-books/:id` | 删除任务书 |
| PATCH | `/quest-books/:bookId/subtasks/:subId/toggle` | 切换子任务完成 |
| DELETE | `/quest-books/:bookId/subtasks/:subId` | 删除子任务 |
| PATCH | `/quest-books/:bookId/independent/:iqId/toggle` | 切换独立任务完成 |
| DELETE | `/quest-books/:bookId/independent/:iqId` | 删除独立任务 |
| GET | `/notes` | 获取所有笔记 |
| POST | `/notes` | 创建笔记 |
| PUT | `/notes/:id` | 更新笔记 |
| DELETE | `/notes/:id` | 删除笔记 |
| GET | `/day-notes/:date` | 获取某日便签 |
| PUT | `/day-notes/:date` | 保存某日便签 |
| GET | `/agent/messages` | 获取对话历史 |
| POST | `/agent/messages` | 保存对话消息 |
| DELETE | `/agent/messages` | 清除对话历史 |
| POST | `/agent/chat` | SSE 流式转发 LLM 请求 |
| GET | `/agent/config` | 获取 API 配置 |
| PUT | `/agent/config` | 保存 API 配置 |

---

## 启动方式

```bash
# 开发模式（全栈）
npm run dev

# 仅静态文件（无数据库）
npm run dev:static

# 打包为 Windows 桌面应用
npm run build:exe
```

启动后访问 `http://127.0.0.1:4173/`。

---

## 项目结构

```
冒险书/
├── backend/
│   ├── server.js           # Express 入口
│   ├── db.js               # SQLite 数据层
│   └── routes/
│       ├── tasks.js
│       ├── questBooks.js
│       ├── notes.js
│       ├── dayNotes.js
│       └── agent.js
├── website/
│   ├── index.html          # 前端主文件 (6300+ 行)
│   ├── server.mjs          # 静态文件服务器（备用）
│   └── assets/
│       ├── guide-anya.png   # 安雅像素风立绘
│       ├── icon.png         # 应用 Logo
│       └── paper-bg-*.png   # 背景纹理（备用）
├── electron/
│   ├── main.js             # Electron 主进程
│   └── preload.js          # 预加载桥接
├── data/                    # SQLite 数据库目录
├── package.json
└── README.md
```
