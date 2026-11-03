# 在线地址生成模块

入口 `/tools/address-generator`。页面参考 USAddressGen 的国家切换、上方生成区、下方字段区及地图布局，保留 LUOPO Tools 的页头、页脚和主题。

## 代码结构

```text
functions/api/address/          随 Cloudflare Pages Git 构建部署的同站接口
server/address/us-worker.ts    优先复用所有者 worker.js 的美国取址和测试资料函数
server/address/us-worker.data.json  原 Worker 的 50 州、100 个参考坐标、姓名及区号配置
server/address/providers.ts    其他国家的开放地图门牌查询
server/address/catalog.ts      22 个国家/地区的少量查询中心，只有坐标和地区标签
server/address/service.ts      请求校验、缓存、限流与数据提供器分发
server/address/config.ts       上游服务网址与 User-Agent
src/tools/other/address-generator/  React 页面、复制、收藏、备注、导出
src/config/address-generator/  Google Maps 与开放地图链接配置
public/_routes.json            仅让 /api/address/* 进入 Functions
scripts/address-generator/     核心接口与数据流测试
```

原始 `worker.js` 和完整来源包保留在仓库外。没有把独立 Worker 的 HTML、内联脚本、广告占位或自动合并提示词塞进应用。

## 美国优先复用 worker.js

复用了 `states`、`stateCoordinates`、`getRandomState`、`getRandomLocationInState`、`formatAddress`、`getAddress` 的反向取址流程，以及可选的测试姓名、性别和电话逻辑。州列表和 100 个参考坐标保持来源数据。未指定州时优先使用原 Worker 的随机州函数。

美国地址在线请求 Nominatim，只接受返回的美国门牌、道路与城市字段。不做 Google 或地址地理正确性核验，不拼造缺失门牌或邮编。格式化直接保留上游州字段，查询所选州只确定参考范围。华盛顿特区使用来源包既有查询中心作为额外参考点。

原循环增加了超时和取消支持；连接失败、上游限流和没有门牌数据分别提示。首次请求可以使用短期缓存；再次点击生成时携带上一次对象 ID，优先重新取址，避免一直显示同一条缓存。短期缓存只保存地图候选，不保存用户收藏和备注。

勾选测试资料时，复用 RandomUser 查询与原 Worker 的姓名/电话兜底函数；这些字段是独立测试资料，和地址住户无关。地址数据不使用任何模拟兜底。

## 其他国家

沿用 `DH-address-real-osm-source` 的 Overpass 查询。目录配置 22 个国家/地区的部分参考城市，不能据此承诺覆盖全国所有地点。只读取开放地图已有的门牌与街道标签；日本适配原始街区字段。缺少城市、州省或邮编时留空并提示，不从所选查询中心补造成实际地址。没有结果时建议更换地区。

美国与其他国家都提供原始 OpenStreetMap 对象链接和 Google Maps 一键查询入口。Google 查询使用标准地址搜索链接，不调用 Google 核验接口、不需要 Google Key，也不标记为已核验。地图预览由用户主动展开，失败不会影响生成、复制或保存。

数据来源：© OpenStreetMap contributors，遵循 [ODbL](https://www.openstreetmap.org/copyright)。

## 公共接口使用限制

Nominatim 公共接口要求整个应用最多每秒一次请求，详见 [使用政策](https://operations.osmfoundation.org/policies/nominatim/)。代码在每个运行实例串行安排美国反查请求、提供短期共享缓存，并对页面操作限流。Cloudflare 跨实例和跨数据中心不保证全局严格限速；公共服务的容量和可用性由上游决定。

Overpass 使用固定、较小的查询范围、有限结果及缓存，见 [公共实例说明](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)。上游失败时直接返回错误，绝不退回本地地址池或模拟地址。

## 部署与本地预览

继续使用原有 GitHub → Cloudflare Pages Git 集成。构建命令仍填 `npm run build`，输出仍为 `dist`；根目录的 `functions/` 会被 Pages 自动打包，`_routes.json` 只启用地址 API。无需在 CF 后台增加 API Key、环境变量、KV、R2、D1、单独 Worker 或新域名。

基础工具仍在浏览器本地处理；地址生成是明确的在线功能例外。Vercel 的原静态配置不会执行 Pages Functions，在线地址服务的部署目标是现有 Cloudflare Pages。

```bash
npm run test:address
npm run lint
npm run format:check
npm run build
```

本地需要运行 Pages API。当前已验证的 Wrangler 命令无需 CF 登录，使用临时 Node.js 22 与 Wrangler，不添加站点依赖：

```bash
npx --yes --package=node@22 --package=wrangler@4.156.2 -- wrangler pages dev dist --port 8788 --ip 127.0.0.1
```

可直接访问 `http://127.0.0.1:8788/tools/address-generator`。现有 Vite 的开发及预览服务会把 `/api/address` 代理到 8788，常用页面地址继续是 `http://127.0.0.1:5191/tools/address-generator`。生产构建不使用本地代理。

## 测试与数据保存

测试只检查接口、字段传递、错误分支、无模拟地址兜底、原 Worker 数据复用和页面交互，不核验实际地址对错或 Google 收录。测试编译产物位于已忽略的 `output/playwright/address-online-unit/`；Wrangler 临时文件也被 Git 和 lint 排除。

收藏使用独立的 v6 存储键，保留旧版记录但不把静态地址池或旧格式自动标为在线结果。支持备注、删除、分页、CSV / JSON / TXT 导出，CSV 处理公式前缀并保留邮编前导零。收藏不上传到服务器。

2026-11-03 本地运行中，国家目录与 Functions 打包成功；实际上游连接曾返回网关/网络错误。该状态只代表当前本地链路，页面会如实提示连接失败，没有据此判定地址内容错误。
