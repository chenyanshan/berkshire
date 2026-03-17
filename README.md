# Berkshire 文档展示站（Cloudflare Workers）

这是一个可部署到 **Cloudflare Workers + Workers Assets** 的静态文档站，用于浏览 `documents_zh_md` 目录中的 Markdown 内容。

## 项目结构

- `documents_zh_md/`：原始 Markdown 文档。
- `public/documents_zh_md/`：用于前端读取的 Markdown 文档副本。
- `public/manifest.json`：文档索引（`id` + `title`）。
- `public/index.html` / `public/styles.css` / `public/app.js`：前端页面与交互逻辑。
- `src/worker.js`：Cloudflare Worker 入口（将请求交由 `ASSETS` 处理）。
- `wrangler.toml`：Worker 配置。

## 本地预览

```bash
python -m http.server 4173 --directory public
```

打开 `http://127.0.0.1:4173` 即可预览。

## 部署到 Cloudflare Workers

1. 安装并登录 Wrangler：

   ```bash
   npm i -g wrangler
   wrangler login
   ```

2. 修改 `wrangler.toml` 中的 `name`（避免与他人重名）。

3. 部署：

   ```bash
   wrangler deploy
   ```

部署完成后会输出 `workers.dev` 访问地址。

## 如何把 GitLab 仓库接入 Workers

你有两种常见方式：

### 方式 A：Cloudflare Dashboard 直连 GitLab（推荐）

1. 进入 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import a repository**。  
2. 选择 GitLab 并授权 Cloudflare 访问你的仓库。  
3. 选择本仓库后，构建命令通常可留空（本项目是静态资源 + worker 入口），部署命令填写：

   ```bash
   npx wrangler deploy
   ```

4. 在 Dashboard 中配置构建环境变量（如需要）：
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`（需有 Workers 编辑权限）

这样后续每次 push 到目标分支，就会自动触发 Workers 构建与部署。

### 方式 B：用 GitLab CI 手动部署到 Workers

1. 在 Cloudflare 创建 API Token（权限至少包含 Workers Scripts Edit）。
2. 在 GitLab 仓库 **Settings → CI/CD → Variables** 新增：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. 在仓库添加 `.gitlab-ci.yml`，在 deploy job 里执行 `npx wrangler deploy`。

这种方式更灵活，适合你已经有统一的 GitLab CI 流程。

## 更新文档内容

当你更新 `documents_zh_md` 后，需要同步到 `public/documents_zh_md` 并更新 `public/manifest.json`，否则网页不会显示新文档。

> 当前仓库中的文档与索引已经准备好，可直接部署。
