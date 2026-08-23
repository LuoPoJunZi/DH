# 部署与恢复指南

本文记录如何从 GitHub 仓库重新建立 LUOPO Tools 的 Cloudflare Pages 持续部署。项目是纯静态 Vite SPA，不需要数据库、CMS、Cloudflare Workers 或常驻服务器。

## 1. GitHub 仓库准备

在 GitHub 创建空仓库后，于本地项目根目录执行：

```bash
git remote add origin <repository-url>
git branch -M main
git add .
git commit -m "feat: initialize static toolbox"
git push -u origin main
```

不要提交 `dist/`、`node_modules/`、`.env` 或密钥。Cloudflare Pages 使用 `package-lock.json` 进行可重复安装，因此锁文件应提交。

## 2. 创建 Cloudflare Pages 项目

1. 登录 Cloudflare Dashboard；
2. 进入 **Workers & Pages**；
3. 选择 **Create application → Pages → Import an existing Git repository**；
4. 授权 GitHub，并选择目标仓库；
5. 在 Build settings 中填写下表；
6. 保存并等待首次部署完成。

| 配置项                 | 值                       |
| ---------------------- | ------------------------ |
| Production branch      | `main`                   |
| Framework preset       | `React (Vite)` 或 `Vite` |
| Build command          | `npm run build`          |
| Build output directory | `dist`                   |
| Root directory         | 仓库根目录，留空         |
| Node.js                | 22                       |

`package.json` 要求 Node.js 20.15+。如 Cloudflare 默认版本不满足，可在 Pages 的环境变量中设置 `NODE_VERSION=22`。

## 3. 自动部署流程

```text
本地修改与测试
→ Commit / Push 到 GitHub
→ Cloudflare Pages 检测 main 分支
→ npm install / npm run build
→ 发布 dist
```

Pull Request 会生成独立的 Preview Deployment。生产部署失败时，Cloudflare 会保留上一次成功版本。

## 4. SPA Routing

Cloudflare Pages 在构建产物不存在顶层 `404.html` 时，默认按 SPA 处理未知路径并返回根页面。项目有意不生成 `404.html`，所以以下路径可直接打开或刷新：

```text
/tools/json-formatter
/tools/base64
/category/developer
```

随后由 React Router 决定页面内容。不要添加 `/* /index.html 200` 到 `_redirects`；Cloudflare Pages 的 redirects 配置不是此项目所需的 SPA 重写机制。

## 5. 自定义域名与 DNS

1. 打开 Pages 项目 → **Custom domains**；
2. 选择 **Set up a custom domain**；
3. 输入域名并按向导确认；
4. 如果域名 DNS 已托管在当前 Cloudflare 账号，记录会自动创建；
5. 如果 DNS 在其他服务商，按 Dashboard 提示添加 CNAME；
6. 等待证书状态变为 Active。

域名启用后，修改 `src/config/site.data.json` 的 `url` 为正式 HTTPS 域名并重新 Push。这样 canonical、Open Graph、Sitemap 和 robots.txt 才会指向正式域名。

## 6. 可选的 Wrangler 手动预览部署

正常维护不需要手动上传 `dist`。仅排查或临时预览时可执行：

```bash
npm run build
npx wrangler pages deploy dist --project-name dh
```

正式流程仍以 GitHub 集成为准。

## 7. 部署异常排查

### 安装失败

- 确认 `package-lock.json` 已提交；
- 确认 Node.js 使用 22；
- 查看 Cloudflare Build log 中第一个 npm 错误；
- 本地执行 `npm ci` 复现。

### 构建失败

- 本地依次运行 `npm run lint`、`npm run build`；
- 检查 TypeScript 或 ESLint 第一个错误；
- 不要通过跳过类型检查来绕过问题。

### 工具页面刷新 404

- 确认部署产物顶层没有 `404.html`；
- 确认部署的是 `dist` 而不是仓库根目录；
- 确认项目没有 Pages Functions 捕获该路由。

### 静态资源 404

- `public` 中资源使用根路径，例如 `/favicon.svg`；
- `src/assets` 中资源通过模块 import；
- 路径区分大小写，Cloudflare 的 Linux 构建环境与 Windows 不同。

### 部署成功但页面仍旧

- 检查当前查看的是 Production 还是 Preview URL；
- 确认提交已推送到 production branch；
- 不为 HTML 设置长期自定义缓存；
- 在 Pages Deployments 中确认最新提交 SHA。

## 8. 更换 Cloudflare 账号恢复

新账号只需要获得 GitHub 仓库权限，按第 2 节重新创建 Pages 项目，再按第 5 节迁移自定义域名。应用没有数据库或服务器状态，因此无需迁移运行时数据。
