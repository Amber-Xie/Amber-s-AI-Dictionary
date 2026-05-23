# 英语词典 · 移动优先学习应用

基于 React + Vite + Supabase + DeepSeek 的英语学习词典，支持查词、单词本、闪卡学习与 GitHub Pages 部署。

## 功能概览

| Tab | 功能 |
|-----|------|
| 查找 | DeepSeek AI 查词（释义 / 洞察 / 例句），有道 TTS 发音，保存到单词本 |
| 单词本 | 列表、排序、重命名、单词详情、链接单词、个人笔记 |
| 学习 | 选择单词本，英译中 / 中译英闪卡 |
| 设置 | DeepSeek API Key、重置密码、退出登录 |

## 快速开始

### 1. 安装依赖

```bash
cd english-dictionary-app
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
VITE_BASE_PATH=/
```

本地开发时 `VITE_BASE_PATH` 保持 `/` 即可。

### 3. Supabase 数据库

若表尚未创建，在 Supabase Dashboard → SQL Editor 中执行 `supabase/schema.sql`。

在 **Authentication → URL Configuration** 中添加：

- Site URL：`http://localhost:5173`（开发）及你的 GitHub Pages 地址
- Redirect URLs：同上，并包含密码重置回调地址

### 4. 本地运行

```bash
npm run dev
```

浏览器打开 `http://localhost:5173`。

## 项目结构

```
src/
├── components/     # 布局、发音、保存弹窗、笔记等
├── context/        # AuthContext
├── lib/            # supabase、deepseek、api
├── pages/          # 各页面
├── App.jsx         # 路由
└── main.jsx
```


## GitHub Pages 部署

### 步骤 1：推送代码

将 `english-dictionary-app` 目录内容作为仓库根目录推送到 GitHub（仓库名例如 `english-dictionary-app`）。

### 步骤 2：配置 Secrets

仓库 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**，添加：

| Secret 名称 | 值 |
|-------------|-----|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 项目的 anon public key |

### 步骤 3：开启 GitHub Pages

1. **Settings** → **Pages**
2. **Build and deployment** → Source 选择 **GitHub Actions**
3. 推送至 `main` 或 `master` 分支后，Actions 会自动构建并部署

### 步骤 4：更新 Supabase 回调地址

部署完成后，将 Pages 地址（如 `https://username.github.io/english-dictionary-app/`）加入 Supabase 的 Site URL 与 Redirect URLs。

Workflow 会自动设置 `VITE_BASE_PATH=/<仓库名>/`，与 Vite `base` 及 React Router `basename` 一致。

## 构建

```bash
npm run build
```

产物在 `dist/` 目录。

## 技术说明

- **DeepSeek API Key** 通过 `supabase.auth.updateUser({ data: { deepseek_api_key } })` 存入 `user_metadata`
- **用户名** 注册时写入 `user_metadata.display_name`
- 所有数据查询均带 `.eq('user_id', user.id)`，配合 RLS 双重保障
- 发音使用有道 TTS：`https://dict.youdao.com/dictvoice?audio=单词&type=2`

## 许可证

MIT
