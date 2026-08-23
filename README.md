# LUOPO Tools

一个简洁、快速、注重隐私的在线工具集合。所有首批工具都直接在浏览器中运行，输入内容不会上传到服务器。项目面向长期扩展设计，可直接部署到 Cloudflare Pages。

正式地址：[https://tool.luopojunzi.com/](https://tool.luopojunzi.com/)

GitHub：[https://github.com/LuoPoJunZi](https://github.com/LuoPoJunZi)

## 功能特点

- 工具名称、描述、分类与关键词的前端即时搜索；
- 数字服务、影视、二次元、音乐、阅读、游戏、娱乐、工具箱和软件九分类网站导航，包含 30 个子分类与 296 个不重复入口；
- 统一配置驱动的首页、分类、路由、相关工具与 Sitemap；
- 工具按路由懒加载，降低首页 JavaScript 体积；
- 跟随系统、浅色与深色三档主题；
- 网站导航作为首页，并根据访问者浏览器本地时间和 IP 定位城市显示欢迎语；
- 适配桌面、平板与手机，支持键盘操作；
- 每个页面独立 SEO 信息；
- JSON、Base64、URL、时间戳、UUID、字数统计、文本去重、进制转换八个首批工具；
- Cloudflare Pages 默认 SPA fallback，深层路由可直接访问和刷新。

## 项目截图

> 待项目所有者提供正式图床 URL。页面结构、响应式与功能不依赖截图资源。

## 技术栈

- React 19
- TypeScript（Strict Mode）
- Vite
- React Router
- Lucide React
- 原生 CSS Design Tokens
- ESLint + Prettier

## 项目结构

```text
.
├── .github/workflows/       # CI
├── docs/                    # 架构与开发记录
├── public/                  # Favicon、Manifest、Headers、生成的 SEO 文件
├── scripts/                 # 构建期脚本
├── src/
│   ├── assets/styles/       # Tokens 与分层样式
│   ├── components/          # 公共、布局、工具复用组件
│   ├── config/              # 站点配置、工具数据与注册表
│   ├── hooks/               # 主题和交互 Hooks
│   ├── layouts/             # 应用布局
│   ├── pages/               # 首页、分类、工具与 404 页面
│   ├── tools/               # 独立工具模块
│   ├── types/               # 共享类型
│   └── utils/               # 纯工具函数
├── AGENTS.md                # AI Agent 开发规范
├── CHANGELOG.md
├── package.json
├── vercel.json              # Vercel SPA 深层路由重写
├── vite.config.ts
└── wrangler.toml
```

## 本地开发

要求 Node.js 20.15+，推荐 Node.js 22。

```bash
git clone <repository-url>
cd <repository-directory>
npm install
npm run dev
```

Vite 会输出本地访问地址。开发命令启动前会自动生成 Sitemap 与 robots.txt。

## 质量检查与构建

```bash
npm run lint
npm run format:check
npm run build
npm run preview
```

生产产物位于 `dist/`。

## 同步网站导航数据

影视、二次元、音乐、阅读、游戏、娱乐、工具箱和软件分类来自刘明野的工具箱公开分类接口。需要同步最新站点时运行：

```bash
npm run sync:navigation
```

脚本会更新 `src/config/liumingye-navigation.data.json`，只保存站点文本、HTTPS 链接和外部 Logo URL，不下载任何图片。同步后仍需运行 `npm run lint` 与 `npm run build`。

## 日常维护方式

完成本地修改后运行：

```bash
npm run lint
npm run build
git add .
git commit -m "feat: describe the change"
git push
```

`dist/` 和 `node_modules/` 均已加入 `.gitignore`，不要提交。Push 后 Cloudflare Pages 会从 GitHub 拉取源代码、安装依赖、构建并自动发布。

## Cloudflare Pages 部署教程

本项目是纯静态 React + Vite SPA，推荐使用 **GitHub + Cloudflare Pages Git Integration**。配置完成后，每次向 `main` 分支 Push，Cloudflare 都会自动安装依赖、构建并发布，无需服务器、数据库、Pages Functions 或业务密钥。

> [!IMPORTANT]
> 创建项目时请选择 Git Integration。Cloudflare Pages 的 Direct Upload 项目以后不能直接切换成 Git Integration；如果希望长期通过 GitHub 自动部署，不要先创建拖拽上传项目。

### 1. 部署前准备

需要准备：

- 一个 Cloudflare 账号；
- 一个包含本项目代码的 GitHub 仓库；
- GitHub 仓库中至少已经 Push 一个 `main` 分支；
- `package.json`、`package-lock.json`、`public/` 和源码均已提交；
- `dist/`、`node_modules/`、`.env` 和密钥没有提交。

首次部署前建议在本地项目根目录执行：

```bash
npm ci
npm run format:check
npm run lint
npm run build
```

确认构建成功并生成 `dist/` 后，再提交和推送代码：

```bash
git add .
git commit -m "feat: prepare cloudflare pages deployment"
git push origin main
```

### 2. 连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 进入 **Workers & Pages**；
3. 选择 **Create application → Pages → Connect to Git**；
4. 选择 GitHub，然后点击 **Install & Authorize**；
5. 建议只授权 Cloudflare 访问需要部署的仓库；
6. 选择本项目仓库，点击 **Begin setup**。

如果仓库没有出现在列表中，打开 GitHub 的 **Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages → Configure**，确认该仓库已经授权。

### 3. 按照部署界面填写构建配置

进入截图所示的 **Set up builds and deployments（设置构建和部署）** 页面后，直接按照下面的值填写：

| 中文界面字段   | 英文界面字段           | 本项目填写值      | 说明                                               |
| -------------- | ---------------------- | ----------------- | -------------------------------------------------- |
| 项目名称       | Project name           | `dh`              | 截图中已经填写；Cloudflare 分配 `dh-3sp.pages.dev` |
| 生产分支       | Production branch      | `main`            | Push 到 `main` 后自动部署生产环境                  |
| 框架预设       | Framework preset       | `React (Vite)`    | 推荐；没有该选项时可选 `无` / `None` 并手动填写    |
| 构建命令       | Build command          | `npm run build`   | 依次生成 SEO、执行 TypeScript 检查并构建 Vite      |
| 构建输出目录   | Build output directory | `dist`            | 输入框中只填写 `dist`，不要填写 `/dist`            |
| 根目录（高级） | Root directory         | 留空              | 代码就在仓库根目录，不是 monorepo                  |
| 环境变量       | Environment variables  | `NODE_VERSION=22` | 变量名填 `NODE_VERSION`，值填 `22`                 |

如果输出目录输入框左侧已经固定显示 `/`，仍然只输入 `dist`；最终界面显示 `/dist` 是正常的。如果页面还显示 **Install command（安装命令）**，填写 `npm ci`；没有该字段则保持 Cloudflare 默认依赖安装流程。

本项目当前不需要 API Key、数据库连接或其他业务环境变量。不要把 Token、密码或 `.env` 内容写进仓库。`package.json` 要求 Node.js 20.15 以上，推荐统一使用 Node.js 22。

填写完成后选择 **Save and Deploy**。首次部署日志应依次看到依赖安装、`npm run build`、`Generated SEO files`、`vite build` 和静态资源上传。部署成功后会生成：

```text
https://dh-3sp.pages.dev
```

如果项目名称已经被占用，Cloudflare 会生成带随机字符的地址，以 Dashboard 实际显示为准。

### 4. 首次部署验收

部署完成后至少检查以下地址：

```text
/
/tools
/tools/json-formatter
/category/developer
```

验收内容：

- 首页、Logo、主题切换和网站导航正常；
- 工具页面能直接打开；
- 在工具页面按浏览器刷新不会出现 404；
- JavaScript、CSS 和 Favicon 没有 404；
- Dashboard 中显示的 Commit SHA 与 GitHub 最新提交一致。

本项目故意不生成顶层 `404.html`。Cloudflare Pages 检测不到顶层 `404.html` 时，会按 SPA 处理未知路径并返回根页面，再由 React Router 接管路由。因此不要额外创建 `404.html`，也不需要添加 `/* /index.html 200` 重写。

### 5. 后续自动发布

日常更新流程：

```bash
npm run lint
npm run build
git add .
git commit -m "feat: describe the change"
git push origin main
```

Push 后 Cloudflare Pages 会自动创建新的生产部署。其他分支和 Pull Request 会生成独立 Preview URL，不会覆盖生产站点。构建失败时，失败版本不会替换上一次成功部署；可在 **Pages project → Deployments** 查看日志、重新部署或回到历史成功版本。

### 6. 绑定自定义域名

1. 打开 **Workers & Pages → dh → Custom domains**；
2. 选择 **Set up a domain**；
3. 输入正式域名，例如 `tools.example.com`；
4. 如果域名 DNS 已托管在同一个 Cloudflare 账号，确认后记录会自动创建；
5. 如果子域名的 DNS 在其他服务商，先在 Pages 项目中完成域名关联，再按照提示添加 CNAME：

```text
Type: CNAME
Name: tools
Target: dh-3sp.pages.dev
```

不要只在 DNS 中手动添加 CNAME 而跳过 Pages 的 **Set up a domain**，否则域名可能返回 522。根域名（例如 `example.com`）需要将该域名作为 Cloudflare Zone，并把 Nameserver 指向 Cloudflare。等待 Dashboard 中域名和 SSL 证书状态变为 **Active** 后再正式使用。

域名生效后，修改 `src/config/site.data.json`：

```json
{
  "url": "https://tools.example.com"
}
```

然后重新 Commit 和 Push。该地址会用于 canonical、Open Graph、Sitemap 和 `robots.txt`，必须填写最终 HTTPS 域名且结尾不要添加路径。

### 7. 可选：使用 Wrangler 手动部署

GitHub 自动部署是正式推荐流程。需要排查构建或临时手动发布时，可以使用仓库中的 `wrangler.toml`：

```bash
npm ci
npm run build
npx wrangler login
npx wrangler whoami
npx wrangler pages deploy dist --project-name dh
```

`npx wrangler whoami` 必须显示正确的 Cloudflare 账号。`--project-name` 必须与 Dashboard 中的 Pages 项目名称一致；如果创建项目时使用了其他名称，请同时修改命令和 `wrangler.toml` 中的 `name`。

如需发布预览分支：

```bash
npx wrangler pages deploy dist --project-name dh --branch=preview
```

### 8. 常见问题

#### Cloudflare 找不到 GitHub 仓库

- 检查 Cloudflare GitHub App 是否获得仓库权限；
- 组织仓库需要组织管理员批准安装；
- 重新进入项目的 **Settings → Builds → Git Repository → Manage** 管理授权。

#### 构建报 Node.js 或依赖错误

- 确认环境变量为 `NODE_VERSION=22`；
- 确认 `package-lock.json` 已提交；
- 本地运行 `npm ci && npm run build` 复现；
- 从 Build log 中查找第一个真实错误，不要只看最后的退出代码。

#### 部署成功但根页面 404

- Build output directory 必须是 `dist`；
- Root directory 必须留空；
- 打开部署产物确认顶层存在 `index.html`；
- 不要把仓库根目录或 `public/` 当作构建产物上传。

#### 深层路由刷新后 404

- 确认 `dist/` 顶层没有 `404.html`；
- 确认部署的是 Cloudflare Pages，而不是配置成普通静态文件服务器的 Worker；
- 不要添加会覆盖 React Router 路由的 Pages Functions。

#### 自定义域名返回 522 或一直验证

- 必须先在 Pages 项目的 **Custom domains** 中添加域名；
- 检查 CNAME 是否指向正确的 `*.pages.dev` 地址；
- 根域名检查 Cloudflare Nameserver 是否生效；
- 如果设置了 CAA，确认允许 Cloudflare 使用的证书颁发机构签发证书。

#### 页面仍显示旧版本

- 确认查看的是 Production URL，而不是旧 Preview URL；
- 在 **Deployments** 核对最新提交 SHA；
- 浏览器执行强制刷新；
- 不要为 HTML 配置长期自定义缓存规则。项目只对带内容哈希的 `/assets/*` 设置长期缓存。

### 9. 官方参考

- [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages SPA Serving Behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)

更完整的部署恢复与迁移说明见 `docs/DEPLOYMENT.md`。

## Vercel 部署教程

本项目也可以作为纯静态 React + Vite SPA 部署到 Vercel。推荐使用 **GitHub + Vercel Git Integration**：导入一次仓库后，`main` 分支的新提交会自动更新生产环境，其他分支和 Pull Request 会生成独立的 Preview Deployment。

### 1. 部署前准备

确认 GitHub 仓库已经包含以下文件：

- `package.json` 与 `package-lock.json`；
- `src/`、`public/` 和其他源代码；
- 根目录的 `vercel.json`；
- 不包含 `dist/`、`node_modules/`、`.vercel/`、`.env` 或任何密钥。

首次部署前建议在本地运行：

```bash
npm ci
npm run format:check
npm run lint
npm run build
```

### 2. SPA 深层路由配置

Vercel 不会默认把未知路径交给浏览器端路由。本仓库根目录已经提供：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

该规则让 `/tools/json-formatter`、`/category/developer` 等地址在直接打开或刷新时仍返回应用入口，再由 React Router 渲染正确页面。不要删除此文件，也不要在 Vercel Dashboard 中配置冲突的重写规则。

### 3. 导入 GitHub 仓库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)；
2. 首次进入 Overview 时，在 **Deploy your first project** 区域找到 **New repository detected**；
3. 确认检测到的仓库是 `LuoPoJunZi/DH`，点击卡片中的 **Import**；
4. 如果没有出现推荐卡片，选择 **Import Project**，连接 GitHub 后再选择该仓库；
5. 不要选择 Chatbot、FastAPI、Next.js 等模板，它们与本项目无关。

如果列表中没有仓库，打开 GitHub 的 **Settings → Applications → Installed GitHub Apps → Vercel → Configure**，确认 Vercel 已获得该仓库的访问权限。

### 4. 填写构建配置

进入 **New Project** 页面后，Vercel 会自动识别 Vite。请确认最终值如下：

| Vercel 配置项      | 本项目填写值    | 说明                                          |
| ------------------ | --------------- | --------------------------------------------- |
| Vercel Team        | 个人 Hobby 团队 | 使用当前账号即可                              |
| Project Name       | `dh`            | 使用小写；正式别名由 Vercel 自动分配          |
| Application Preset | `Vite`          | Vercel 已能自动识别，不要选择 Next.js         |
| Root Directory     | `./`            | 项目位于仓库根目录，不需要点击 Edit           |
| Build Command      | `npm run build` | 点击铅笔启用覆盖，明确填写此值                |
| Output Directory   | `dist`          | 点击铅笔启用覆盖，只填写 `dist`               |
| Install Command    | 保持默认        | 不启用覆盖；根据 `package-lock.json` 使用 npm |

展开 **Build and Output Settings** 后再核对后三项。**Environment Variables** 保持折叠且不添加内容；本项目不需要数据库、Vercel Functions、API Key 或其他环境变量。

部署完成后，Overview 中显示 Node.js `24.x` 属于正常结果。Vercel 会结合当前受支持版本和 `package.json` 的 `engines.node` 自动选择版本，本项目已经在该版本构建成功，无需改成 22.x。

### 5. 首次部署与验收

点击 **Deploy**。构建日志应依次出现依赖安装、`npm run build`、`Generated SEO files`、TypeScript 检查和 Vite 构建。出现 **Congratulations!** 即表示首次生产部署完成；页面上的 **Install Coding Agent Plugin** 是可选推广项，不需要安装。

本项目当前的稳定生产别名是：

```text
https://dh-pied.vercel.app
```

Overview 中还会显示类似 `dh-ier85n074-luopojunzis-projects.vercel.app` 的带哈希 Deployment URL。该地址固定指向某一次构建；日常访问和分享应使用不带构建哈希的生产别名 `dh-pied.vercel.app`。

至少检查以下地址：

```text
/
/tools
/tools/json-formatter
/category/developer
```

验收内容：

- 首页、Logo、搜索、分类和主题切换正常；
- 工具页面可以直接打开并刷新，不出现 Vercel 404；
- JavaScript、CSS、Favicon 和外部 Logo 正常加载；
- Production Deployment 状态为 `Ready`；
- Source 显示 `main`，Git Commit 与 GitHub 最新提交一致。

Vercel 自动生成的站点预览图可能显示 `San Jose`，因为截图请求来自 Vercel 的服务器；真实访客打开页面时仍会根据访客 IP 显示城市。

### 6. 理解 Overview 状态和后续自动部署

首次部署后的 Overview 可能显示以下状态，它们都属于正常情况：

- **Function Invocations = 0**：本项目是纯静态网站，没有使用 Vercel Functions；
- **No Active Branches**：目前只有 `main` 生产分支，没有额外的 Preview 分支；
- **Production Checklist 1/5**：其他项目是可选建议，不影响网站运行；
- **Analytics / Speed Insights 未启用**：两者均非必需。考虑到项目的轻量与隐私定位，在明确需要访问统计前保持关闭；
- **Fluid Compute、Function CPU、Function Region**：只影响 Functions，本项目无需调整。

GitHub 自动部署规则如下：

- Push 或合并到生产分支 `main`：创建 Production Deployment，并更新生产域名；
- Push 到其他分支或创建 Pull Request：生成独立 Preview Deployment，不覆盖生产环境；
- 构建失败：打开项目的 **Deployments**，进入失败记录查看 Build Logs 中的第一个错误；
- 需要回退：可重新部署历史成功记录，或在 Git 中回退对应提交后重新 Push。

### 7. 绑定自定义域名

1. 打开 Vercel 项目；
2. 进入 **Settings → Domains**；
3. 点击 **Add Domain** 并输入域名，例如 `tools.example.com`；
4. 按 Vercel 当前页面给出的 A、CNAME 或 TXT 记录配置 DNS；
5. 如果 DNS 托管在 Cloudflare，请在 Cloudflare DNS 页面添加 Vercel 显示的准确记录；
6. 等待 Vercel 显示域名配置有效并自动签发 HTTPS 证书。

不要照抄其他项目的 DNS 目标；Vercel 可能会为项目生成专用 CNAME。正式域名生效后，将 `src/config/site.data.json` 的 `url` 改为最终 HTTPS 地址并重新 Push，使 canonical、Open Graph、Sitemap 和 `robots.txt` 指向正式域名。

如果不绑定自定义域名，则应把上述 `url` 设置为 `https://dh-pied.vercel.app`，不要继续保留其他平台的临时地址。

### 8. 可选：使用 Vercel CLI

GitHub 自动部署是推荐的正式维护方式。需要创建临时预览时，可在项目根目录执行：

```bash
npx vercel
```

首次运行会要求登录、选择账号并关联项目，随后生成 Preview URL。确认预览无误并确实需要从本地发布生产版本时再执行：

```bash
npx vercel --prod
```

CLI 创建的 `.vercel/` 只保存本地项目关联信息，已经加入 `.gitignore`，不要提交到 GitHub。

### 9. 常见问题

#### 首页正常但工具页面刷新后 404

- 确认仓库根目录存在并已提交 `vercel.json`；
- 确认 Root Directory 为仓库根目录；
- 检查 Dashboard 是否存在覆盖该文件的冲突路由配置；
- 修正后重新部署，并直接访问 `/tools/json-formatter` 验证。

#### 构建成功但网站显示 Vercel 404

- Framework Preset 应为 `Vite`；
- Build Command 应为 `npm run build`；
- Output Directory 必须是 `dist`；
- 打开 Build Output，确认 `dist/index.html` 已生成。

#### 构建时报 Node.js 或依赖错误

- 确认 `package-lock.json` 已提交；
- 本地运行 `npm ci && npm run build` 复现；
- 在 **Settings → Build and Deployment** 查看 Node.js、Install Command 和 Root Directory；
- 从 Build Logs 中处理第一个真实错误，不要仅根据最后的退出代码判断。

#### 页面仍然是旧版本

- 确认当前访问的是 Production Domain，而不是旧 Preview URL；
- 在 Deployments 中核对最新 Production Deployment 的 Commit SHA；
- 确认提交已经进入生产分支 `main`；
- 必要时从 Deployments 对最新提交执行 Redeploy。

### 10. Vercel 官方参考

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Deploying Git Repositories](https://vercel.com/docs/git)
- [Accessing Deployments through Generated URLs](https://vercel.com/docs/deployments/generated-urls)
- [Deployments Overview](https://vercel.com/docs/deployments/overview)
- [Vercel Project Configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Supported Node.js Versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Adding and Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

## 如何添加新工具

1. 在 `src/tools/<category>/<tool-id>/` 创建工具组件并默认导出；
2. 在 `src/config/tools.data.json` 添加完整元数据；
3. 在 `src/config/tools.ts` 的 `toolLoaders` 中增加一条动态导入；
4. 按需在 `src/tools/<category>/<tool-id>/utils.ts` 放置可测试的纯函数；
5. 运行 `npm run lint && npm run build`。

注册后，工具会自动进入首页搜索、分类页面、动态路由、相关工具和 Sitemap。不要在其他页面重复维护工具列表。

## 配置品牌

网站名称、描述、URL、作者、GitHub、个人博客和分类统一位于 `src/config/site.data.json`。正式 Logo、项目截图等图床链接统一位于 `src/config/images.ts`。网站导航注册表位于 `src/config/webNavigation.ts`，同步生成的数据位于 `src/config/liumingye-navigation.data.json`，只收录 HTTPS 地址。绑定正式域名、GitHub 仓库或图床资源后只需更新配置并重新构建。

欢迎语的定位接口集中配置在 `src/config/visitorLocation.ts`。请求由访客浏览器直接发起，城市仅在当前浏览器会话中缓存，本站没有后端，也不会保存定位结果；接口不可用时回退到浏览器时区城市。

## 贡献指南

修改前请先阅读 `AGENTS.md` 和 `docs/DEVELOPMENT.md`。保持改动边界清晰，使用 Conventional Commits，并确保 lint 与 production build 通过。

## 隐私

首批工具全部使用浏览器本地能力处理数据，不会将输入上传到任何服务。未来若加入依赖远程 API 的工具，必须在页面上明确说明数据流向。

## License

项目暂未指定开源许可证。在添加许可证前，保留所有权利。
