# 地址生成模块

本目录是 DH 的独立地址生成功能。基于项目所有者指定的 [jiangnan1224/AddressGenerator feature/real-addresses](https://github.com/jiangnan1224/AddressGenerator/tree/feature/real-addresses) 分支改编，保留其 Photon / Overpass 查询、地址分类、各国格式化、香港双语、免州销售税筛选和随机测试资料逻辑。

## 目录

- worker.js：生成逻辑的公开入口，原始单文件源码已按职责拆分。
- worker.d.ts：JavaScript 与主站 TypeScript 间的严格类型接口。
- data/catalog.ts：主站的国家、地区与参考城市；保留原有目的地并补齐参考项目，共 30 个国家/地区。只有查询坐标，没有本地门牌池。
- data/locations.js：参考项目的城市、美国州及电话区号配置。
- data/profiles.js：随机姓名与电话格式；只产生测试资料，不关联真实住户。
- server/engine.js：候选选择、地址类型筛选与请求总预算。
- server/sources.js：Photon 优先、Overpass 备用、Nominatim 按需补充行政信息；取消、短超时与响应大小限制。
- server/candidates.js：住宅、商业、公共设施与用途未标注的分类规则。
- server/format.js：各国格式化、美国州缩写及香港英/繁体中文版本。
- server/settings.js：公共地图地址、查询上限、分类和格式配置。
- server/adapter.ts：将参考 Worker 的结果转换为 DH 兼容记录，检查原始对象 ID、国家及门牌字段。
- server/service.ts：同站 API、请求校验、限流、候选缓存及随机抽取。
- client/：React 工作台、地址与地图展示、收藏、备注、导出和页面样式。
- shared/：记录类型、运行时检查与地图查询链接。
- tests/、scripts/：离线回归用例及零新增依赖的测试入口。

## 与主站的连接

主站只保留现有工具注册及三个薄入口：src/tools/other/address-generator/AddressGeneratorTool.tsx、functions/api/address/catalog.ts 和 generate.ts。其余实现集中在本目录；旧的 server/address、src/config/address-generator 和分散在旧工具目录中的实现已移除。

页面入口为 /addr，旧地址 /tools/address-generator 自动跳转并保留查询参数和锚点；API 保持 /api/address/catalog 与 /api/address/generate。全站导航、页头、页脚和 ThemeProvider 继续复用主站。

## 数据与速度

Photon 一次查询附近多个带门牌号的对象，在通过分类和原始字段检查后缓存候选 5 分钟。再次生成优先选择与上一条不同的候选，避免每次重复远程查询。不同城市、住宅/商业类型和免税州选项分别缓存。单条候选被再次请求时会重新在线取址。

地图查询最多 6 轮，整体预算约 25 秒；Photon 单次最多 4.5 秒，Overpass 单节点最多 3.5 秒，行政信息补充最多 1.5 秒。Nominatim 的补充请求在每个运行实例按 1.1 秒间隔安排；跨 Cloudflare 实例不能保证全局严格限速。公共服务无可用性承诺，代码保留明确失败反馈。

只接受地图返回的门牌、道路、国家、坐标和原始 OpenStreetMap 对象。行政字段仅从地图响应补充；依然缺失时显示未提供。不会退回本地地址池或编造地址。Google Maps 提供查询，并在生成结果后自动加载右侧预览；地图失败可重试，不进行 Google 收录核验。

住宅模式遵循上游逻辑：优先明确住宅标签，没有时允许用途未标注的门牌，并如实显示用途未标注；商业模式不把住宅混入结果。免税州仅指州销售税，地方销售税及其他税种另计。

收藏仍使用原 v6 存储键；旧收藏没有新分类元数据也能读取。CSV / JSON / TXT 导出保留备注和来源，邮编前导零不会丢失。R 快捷键在输入框、下拉框和备注编辑时不触发。

## 部署和验证

继续使用 GitHub → Cloudflare Pages 自动构建。构建命令 npm run build、产物目录 dist 不变；无需新增 Worker 项目、API Key、环境变量、KV、R2 或数据库。functions/ 下的薄入口会将本目录打包成 Pages Functions；worker.js 不需要另行部署。

本地：npm run build；用现有 Wrangler pages dev dist --port 8788 --ip 127.0.0.1 运行接口，然后启动 Vite 预览。Vite 会把 /api/address 代理到 8788。

检查：npm run test:address、npm run lint、npm run format:check、npm run build。

源码来源和原模块许可证见 THIRD_PARTY_NOTICES.md、LICENSE。公共接口使用说明：[Photon](https://github.com/komoot/photon#demo-server)、[Overpass](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)、[Nominatim](https://operations.osmfoundation.org/policies/nominatim/)。地址数据 © OpenStreetMap contributors，遵循 ODbL。
