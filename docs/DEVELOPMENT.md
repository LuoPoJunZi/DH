# 开发记录

## 项目架构说明

应用采用静态 SPA 架构。`tools.data.json` 是工具名称、路由、搜索与 SEO 的单一数据源；`tools.ts` 只维护 ID 到懒加载组件的映射。首页、分类页、工具路由、相关工具和 Sitemap 都从同一份元数据派生。外部网站导航由 `webNavigation.ts` 注册，参考站同步数据集中保存在 `liumingye-navigation.data.json`，页面组件不散落硬编码链接。

全局状态仅有主题，使用 Context 与 `localStorage` 管理。各工具的输入状态留在工具模块内部，避免不必要的状态管理依赖。

## 重要设计决策

### 2026-08-21：采用 React + Vite 静态 SPA

原因：构建快、生态稳定、Cloudflare Pages 直接支持，工具组件可以按路由懒加载。首版不引入 SSR、数据库或 Pages Functions。

### 2026-08-21：使用 JSON 作为工具元数据单一来源

原因：首页搜索、分类、路由与构建期 Sitemap 都需要读取同一数据。JSON 可被浏览器端 TypeScript 和 Node 构建脚本同时安全读取，避免重复维护路由清单。

### 2026-08-21：使用原生 CSS 设计系统

原因：首版视觉系统规模有限，CSS 自定义属性足够支持主题和响应式，减少 Tailwind 或 UI 框架带来的依赖与约定成本。

### 2026-08-21：依赖 Cloudflare Pages 默认 SPA fallback

Pages 在产物没有顶层 `404.html` 时，会将未知请求交给根页面。项目因此不生成 `404.html`，也不添加不受 Pages `_redirects` 支持的 200 重写。

### 2026-08-21：控制仓库媒体体积

Logo、Favicon 和 UI 图标等小型核心资源随代码版本管理。普通展示图片优先使用集中配置的稳定 HTTPS URL，大量自有媒体迁移到 CDN/R2；不下载第三方图片，不把大图转成 Base64 写入源码。外部图片不得成为工具功能依赖。

正式展示图片由项目所有者通过自有图床提供，URL 统一写入 `src/config/images.ts`。缺少 URL 时使用无图设计或占位，不搜索或下载第三方素材。Header Logo 使用项目所有者提供的 HTTPS 图床地址，`favicon.svg` 作为加载失败时的小型本地核心 fallback。

### 2026-08-21：网站导航与本地工具分离

网站导航承载第三方站点入口并作为根路径首页，本地工具首页位于 `/tools`，两者使用独立路由和配置。旧 `/navigation` 路径重定向到根路径。外部链接仅使用 HTTPS、新标签页打开并添加 `noopener noreferrer nofollow`，页面明确提示第三方内容和隐私政策由其运营方负责。

### 2026-08-21：同步参考站分类导航

`scripts/sync-web-navigation.mjs` 从刘明野的工具箱公开分类接口同步 8 个主分类和 24 个子分类，生成只含文本与 URL 的静态 JSON。站点已有 HTTPS 官网时直接使用；缺少 HTTPS 目标时使用参考站的 HTTPS 详情页。Logo 继续使用外部 HTTPS URL，不下载到仓库。运行 `npm run sync:navigation` 后必须重新执行 lint 与生产构建。

### 2026-08-21：使用 IP 定位城市生成欢迎语

导航首页由访客浏览器依次请求 `visitorLocation.ts` 中配置的第三方 IP 定位接口，每个接口 3 秒超时，成功后只在 `sessionStorage` 缓存城市。项目不设置定位后端、不上传工具输入，也不保存访客 IP 或城市；接口不可用时回退到浏览器时区城市和站点名称。

### 2026-08-22：收敛全局导航

Header 只保留“首页”和“在线工具”两个主入口，工具分类与具体工具统一在 `/tools` 页面内浏览，避免少量工具同时占用目录弹层和多个分类快捷入口。Footer 不再重复主导航，改为读取站点配置中的个人博客外链。

### 2026-08-22：合并低密度网站分类

将原有 AI、云服务和网络三个一级分类合并为“数字服务”，通过 AI 助手、云与开发、域名服务、网络检测、网络客户端和个人站点六个子分类继续保持浏览效率。新增入口从项目所有者的常用网站清单中筛选，优先使用官方 HTTPS 地址，并继续通过统一 favicon 服务加载外部 Logo，不下载图片到仓库。

## 已实现的重要功能

- 响应式首页、工具搜索与分类过滤；
- 网站导航作为根路径首页，原工具首页位于 `/tools`；
- 网站导航首页显示根据浏览器本地时间和 IP 定位城市变化的欢迎语；
- 统一工具页面、面包屑、隐私说明、使用方法和相关工具；
- 全局主题三态切换与首屏防闪烁；
- 八个完全在浏览器本地运行的代表性工具；
- 九分类、30 个子分类、296 个不重复入口的网站导航，全站站点搜索和移动端横向分类栏；
- 基于路由的页面标题、description、keywords、canonical、Open Graph 与 Twitter Card；
- 构建前从工具配置生成 Sitemap 和 robots.txt。

## 遇到的问题与解决方式

### 深层路由刷新

问题：`/tools/json-formatter` 由 BrowserRouter 管理，静态平台若直接查找文件可能返回 404。

解决：Cloudflare Pages 对没有顶层 `404.html` 的站点默认启用 SPA fallback。项目保持这一产物结构，并由 React Router 处理浏览器前进后退和站内 404。

## Cloudflare Pages 配置

- Production branch：`main`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：仓库根目录
- Node.js：22（或满足 `package.json` engines 的版本）

## 后续开发计划

1. 图片压缩与格式转换；
2. 颜色格式转换与单位换算；
3. Markdown 预览与文本差异对比；
4. 为转换算法增加 Vitest 单元测试；
5. 绑定正式域名后更新 `site.data.json` 的 URL 并重新构建。

## TODO

- [ ] 替换临时 `pages.dev` 站点 URL；
- [ ] 补充正式 GitHub 仓库地址和作者信息；
- [ ] 设计社交分享图；
- [ ] 增加端到端无障碍回归测试；
- [ ] 根据真实使用数据调整热门工具排序。
