# AGENTS.md

## 1. 项目目标

LUOPO Tools 是一个部署到 Cloudflare Pages 的静态在线工具箱。工具优先在浏览器本地运行，强调速度、隐私、可访问性与长期可维护性。每次修改应以未来会增长到数十或上百个工具为前提。

项目性质：**Pure Static Website / GitHub Repository / Cloudflare Pages Deployment**。GitHub 仓库是网站代码、配置与内容的 Source of Truth，维护流程固定为本地编辑与测试 → Git Commit → Push GitHub → Cloudflare Pages 自动构建部署。

## 2. 技术栈

- React 19、TypeScript 严格模式、Vite 6（兼容本地 Node.js 20.15）
- React Router（BrowserRouter）
- 原生 CSS 自定义属性与 Lucide 图标
- ESLint Flat Config、Prettier
- 纯静态产物，部署到 Cloudflare Pages

禁止添加常驻 Node.js 服务。只有确有必要时才引入新依赖。

## 3. 修改前必读

开始修改前依次阅读：

1. 本文件；
2. `README.md`；
3. `package.json`；
4. 与任务直接相关的模块和 `docs/DEVELOPMENT.md`。

保留用户已有修改。采用最小修改原则，不为新增单个工具重构整站。

## 4. 目录职责

- `src/components/common`：无业务含义的复用组件；
- `src/components/layout`：Header、Footer 等全局布局；
- `src/components/tool`：工具页共享工作区组件；
- `src/config`：站点、分类、工具元数据与注册表；
- `src/layouts`：页面级统一布局；
- `src/pages`：路由页面；
- `src/tools/<category>/<tool-id>`：独立工具实现；
- `src/types`：共享类型；
- `src/utils`：无 React 依赖的纯函数；
- `scripts`：构建期脚本；
- `public`：直接复制到构建产物的静态资源；
- `docs`：架构和开发记录。

## 5. 工具模块规范

每个工具使用唯一 kebab-case ID，并在 `src/config/tools.data.json` 中声明名称、描述、分类、路径、图标、关键词与 SEO。实现放在对应工具目录，默认导出页面组件。随后在 `src/config/tools.ts` 的懒加载映射中增加一行。

工具必须：

- 使用统一 `ToolPage`、`ToolWorkspace` 与表单样式；
- 处理空值、格式错误、不支持能力和合理的输入规模；
- 能在浏览器完成时不得上传数据；
- 按实际需要提供示例、清空、复制、下载等操作；
- 不得使用阻塞式 `alert`，反馈应使用内联状态或 Toast；
- 复杂逻辑放入同目录的 `utils.ts` 并保持为纯函数。

## 6. 编码规范

- 使用函数组件、Hooks、具名导出（工具懒加载页面使用默认导出）；
- 禁止 `any`；必须为公开数据结构定义类型；
- 组件只承担一个清晰职责，重复 UI 抽为公共组件；
- 用户可见文案使用中文；代码标识、提交信息与注释使用清晰英文；
- 不把站点名称、网址、作者等品牌信息散落在页面中；
- 不提交密钥、个人令牌、`.env` 或生成目录。

## 7. UI 规范

- 使用 `src/assets/styles/tokens.css` 中的颜色、间距、圆角和阴影变量；
- 维持米白/墨色基底和单一钴蓝强调色；
- 卡片只用于可点击工具入口或确有分组语义的工作区；
- 保证手机 320px 宽度无横向滚动，点击目标至少 40px；
- 图标按钮必须有 `aria-label`，输入必须有可关联的 `label`；
- 动画应短促、可被 `prefers-reduced-motion` 禁用；
- Light、Dark 与 System 主题通过全局 ThemeProvider 管理。

## 8. Git 规范

使用 Conventional Commits，例如：

- `feat: add color converter tool`
- `fix: preserve unicode during base64 encoding`
- `docs: update cloudflare deployment guide`

不要使用 `update`、`fix stuff` 等模糊信息。未经用户明确要求，不执行提交、推送、强制覆盖或历史改写。

## 9. 测试与验收

每次功能修改至少运行：

```bash
npm run lint
npm run build
```

同时检查：键盘操作、浅深主题、移动端布局、工具错误分支、深层路由直接打开。新工具的纯函数逻辑复杂时应补充单元测试，再引入最小测试依赖。

## 10. Cloudflare Pages 限制

- Build command：`npm run build`
- Output directory：`dist`
- 不创建顶层 `404.html`，以启用 Pages 默认 SPA fallback；
- 不依赖 Node.js 内置模块运行时、数据库或本地磁盘；
- `wrangler.toml` 仅用于可选的 Wrangler 部署；
- 浏览器端不得包含 API Key。

## 11. 静态资源与图片

- GitHub 是代码仓库，不是图床；只保存 Logo、Favicon、UI 图标和少量必要的小型图片；
- 展示、教程、文章和较大背景图片优先使用稳定的外部 HTTPS URL；
- 外部图片 URL 集中放在 `src/config` 或 `src/data`，不得散落在页面组件中；
- 不得擅自下载第三方图片、提交来源不明资源或把大图写成 Base64/Data URI；
- 正式图片 URL 由用户的图床提供；缺少时先完成无图布局或占位，不自行搜索素材；
- 确有必要请求图片时，一次说明用途、比例、尺寸、格式、透明背景和深浅色版本要求；
- 非首屏图片使用 `loading="lazy"`、准确 `alt` 和不破坏布局的失败回退；
- 外部图片失效不得影响工具核心功能；大量自有媒体应使用 CDN、R2 或对象存储。

## 12. 禁止事项

禁止把应用合并成巨型单文件、复制整套工具布局、散落重复工具配置、引入大型 UI/状态管理框架、未经说明大规模重构、直接复制第三方站点代码或品牌资源。
