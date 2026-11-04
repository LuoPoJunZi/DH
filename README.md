# LUOPO Tools

网站导航与在线工具集合，部署在 Cloudflare Pages。基础工具在浏览器中运行，地址生成使用在线开放地图数据，收藏保存在当前浏览器。

[访问网站](https://tool.luopojunzi.com/) · [GitHub 仓库](https://github.com/LuoPoJunZi/DH)

## 目录

| 目录                 | 内容                                               |
| -------------------- | -------------------------------------------------- |
| `src/`               | 主站页面、组件、样式、导航配置与基础工具           |
| `addr/`              | 独立地址模块：页面、生成逻辑、数据、测试与来源说明 |
| `functions/`         | 地址 API 的 Cloudflare Pages 入口                  |
| `public/`            | 站点图标、Manifest 和发布配置                      |
| `scripts/`           | SEO 生成与导航数据同步脚本                         |
| `config/`            | Vite、ESLint 和 TypeScript 分项配置                |
| `docs/`              | 开发、部署与历史记录                               |
| `.github/workflows/` | 自动质量检查                                       |

## 本地开发

使用 Node.js 20.15+，推荐 Node.js 22。

```bash
npm ci
npm run dev
```

基础工具可以直接预览。地址生成还需要本地 Pages 接口，启动方法见 [地址模块说明](addr/README.md#部署和验证)。

## 检查与构建

```bash
npm run test:address
npm run lint
npm run format:check
npm run build
npm run preview
```

生产产物位于 `dist/`。GitHub Actions 使用同一组测试、格式与构建检查。

## 发布

日常流程：本地修改与检查 → Commit → Push 到 `main` → Cloudflare Pages 自动部署。

- 构建命令：`npm run build`
- 输出目录：`dist`
- 页面：`/` 网站导航、`/tools` 在线工具、`/addr` 地址生成
- 地址 API 随根目录 `functions/` 一起部署，无需新增密钥、数据库或独立 Worker。

部署、域名与恢复步骤集中在 [部署指南](docs/DEPLOYMENT.md)。

## 常用修改位置

| 内容                           | 文件                                        |
| ------------------------------ | ------------------------------------------- |
| 名称、域名、作者和工具分类     | `src/config/site.data.json`                 |
| Logo 和桌面、手机背景图链接    | `src/config/images.ts`                      |
| 顶部导航                       | `src/config/navigation.ts`                  |
| 网站导航分类、简介与自定义链接 | `src/config/webNavigation.custom.data.json` |
| 导航同步生成数据               | `src/config/liumingye-navigation.data.json` |
| 工具名称、路径、关键词与 SEO   | `src/config/tools.data.json`                |
| 工具组件懒加载                 | `src/config/tools.ts`                       |
| 地址生成                       | `addr/`                                     |

添加基础工具时，在 `src/tools/<category>/<tool-id>/` 实现组件，再登记工具元数据和懒加载入口。地址生成直接维护在独立的 `addr/` 目录。

导航数据同步命令：

```bash
npm run sync:navigation
```

同步后检查站点条目并重新执行 lint 和 build。本地分类及链接修正由自定义配置维护。

## 文件维护

格式规则合并在 `package.json` 的 `prettier` 字段；构建和检查配置集中在 `config/`，日常使用上面的 npm 命令即可。

- 图标和少量必要资源放在 `public/`；背景图使用集中配置的外部链接。
- `dist/`、`node_modules/`、本地 AI 配置、截图、日志和工具缓存不提交。
- Sitemap 与 robots.txt 由开发和构建命令生成，不纳入 Git 跟踪。
- 保留依赖锁文件、构建配置和许可证，以便安装、部署与维护。

## 文档

- [开发记录](docs/DEVELOPMENT.md)
- [部署与恢复指南](docs/DEPLOYMENT.md)
- [地址模块说明](addr/README.md)
- [历史变更](docs/CHANGELOG.md)

## License

主站采用 [MIT License](LICENSE)。地址模块的来源和许可证见 [第三方说明](addr/THIRD_PARTY_NOTICES.md)。
