# 离线图片与趣味玩法增强实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 本地化全部商品图片，并通过 10 项增量改进增强游戏的可玩性、可恢复性和部署可靠性。

**架构：** 商品图片放入 `public/products`，并由统一路径工具适配 Vite 部署基址。玩法算法保持为纯函数，Pinia 负责动作事务、撤销和持久化，新增面板承载入口与反馈。

**技术栈：** Vue 3、Composition API、Pinia、Vite、Vitest、CSS3、WebP。

---

## 文件结构

- 创建 `src/stores/gameplayCore.js`：玩法纯函数与采购包配置。
- 创建 `src/stores/gameplayCore.test.js`：玩法算法测试。
- 创建 `src/stores/spendingStore.test.js`：动作日志与持久化编排测试。
- 创建 `src/utils/productImage.js`：部署基址感知的本地图片解析。
- 创建 `src/utils/productImage.test.js`：图片路径测试。
- 创建 `scripts/localize-product-images.mjs`：可重复执行的图片下载、转换与完整性校验脚本。
- 创建 `src/components/PlaygroundPanel.vue`：玩法控制台和消费历史。
- 创建 `public/products/*.webp`：本地商品图片与占位图。
- 修改 `src/stores/spendingCore.js`：支持数量动作的原子应用与回退。
- 修改 `src/stores/spendingCore.test.js`：动作边界测试。
- 修改 `src/stores/spendingStore.js`：统一动作、撤销和持久化。
- 修改 `src/App.vue`：接入玩法面板。
- 修改 `src/components/ProductCard.vue`：统一图片解析与失败兜底。
- 修改 `src/styles/main.css`：玩法面板及响应式样式。
- 修改 `src/data/products.json`：远程图片改为本地路径。
- 修改 `src/data/products.test.js`：本地资源完整性审计。

### 任务 1：本地图片资源

- [ ] 编写资源审计测试，要求所有图片路径匹配 `/products/<id>.webp`、文件非空，且前 12 字节满足 RIFF/WEBP 魔数。
- [ ] 运行 `npm test -- src/data/products.test.js`，确认因远程 URL 失败。
- [ ] 创建 `scripts/localize-product-images.mjs`：读取原始 JSON，以 URL 为键缓存到 `os.tmpdir()`；对每个唯一 URL 执行 `spawnSync('curl', ['--fail', '--fail-early', '--location', '--retry', '3', '--output', tempPath, url])`，非 0 立即 `process.exit(1)`；对每个商品执行 `spawnSync('cwebp', ['-quiet', '-resize', '800', '0', '-q', '82', cachedPath, '-o', 'public/products/<id>.webp'])`，非 0 立即退出；最后逐个读取前 12 字节校验 RIFF/WEBP 魔数并输出 110/110。
- [ ] 审计 105 个唯一 URL，用同品类有效来源替换 6 个失效 URL；随后运行 `node scripts/localize-product-images.mjs`，要求输出 100 个有效下载源和 110 个有效商品文件。
- [ ] 将 JSON 图片字段改为本地路径，生成本地占位图。
- [ ] 运行资源测试，确认 110 个商品全部通过。
- [ ] 提交资源变更：`git add scripts/localize-product-images.mjs public/products src/data/products.json src/data/products.test.js && git commit -m "feat(资源): 将商品图片全部本地化"`。

### 任务 2：玩法纯函数

- [ ] 为 `getAffordableProducts(products, remaining)`、`quoteBundle(bundle, products)`、`getCollectionProgress(state)` 和 `getAdvisorMessage(context)` 编写失败测试。
- [ ] 运行 `npm test -- src/stores/gameplayCore.test.js`，确认模块缺失。
- [ ] 实现 `gameplayCore.js` 的最小纯函数。
- [ ] 再次运行测试并确认通过。
- [ ] 提交玩法核心：`git add src/stores/gameplayCore.js src/stores/gameplayCore.test.js && git commit -m "feat(玩法): 添加采购与顾问算法"`。

### 任务 3：事务、撤销与恢复

- [ ] 为 `applyQuantityChanges(state, changes)`、`reverseQuantityChanges(state, changes)` 和 `restoreSpendingState(products, initialBalance, snapshot)` 编写失败测试。
- [ ] 覆盖余额不足不部分成交、负数量不越过 0、商品失效、非法数量和恢复后消费不超过资产上限。
- [ ] 运行 `npm test -- src/stores/spendingCore.test.js`，确认期望行为尚未实现。
- [ ] 扩展 `spendingCore.js`，实现原子动作、反转与安全恢复。
- [ ] 运行测试并确认通过。
- [ ] 提交事务核心：`git add src/stores/spendingCore.js src/stores/spendingCore.test.js && git commit -m "feat(状态): 添加原子交易与安全恢复"`。

### 任务 4：Pinia 编排

- [ ] 创建 `spendingStore.test.js`，先覆盖单买和批量购买只生成 1 条日志、增减操作精确撤销、随机买和采购包、采购包余额不足不部分成交、随机豪购无候选时状态不变并提示。
- [ ] 覆盖刷新恢复、损坏 JSON、快照版本不匹配、商品失效、`localStorage` 读写异常与 reset 清除快照。
- [ ] 运行 `npm test -- src/stores/spendingStore.test.js`，确认失败。
- [ ] 将单买、批量买、随机买、采购包和减购统一为动作日志。
- [ ] 接入撤销、历史、收藏进度、顾问播报和版本化持久化。
- [ ] 确保重置同时清除持久化状态。
- [ ] 运行全部 store 测试。
- [ ] 提交状态编排：`git add src/stores/spendingStore.js src/stores/spendingStore.test.js && git commit -m "feat(状态): 添加撤销历史与本地存档"`。

### 任务 5：界面与图片兜底

- [ ] 为 `resolveProductImage(path, baseUrl)` 和 `handleProductImageError(event, fallback)` 编写失败测试，覆盖 GitHub Pages 子路径和只兜底一次。
- [ ] 实现基址感知的 `resolveProductImage` 和占位图切换。
- [ ] 创建 `PlaygroundPanel.vue` 并接入 `App.vue`。
- [ ] 更新响应式样式，保持现有视觉体系。
- [ ] 提交界面变更：`git add src/App.vue src/components/PlaygroundPanel.vue src/components/ProductCard.vue src/styles/main.css src/utils/productImage.js src/utils/productImage.test.js && git commit -m "feat(界面): 添加趣味采购控制台"`。

### 任务 6：完整验证与部署

- [ ] 运行 `npm test`，要求全部测试通过且无警告。
- [ ] 运行 `npm run build`，检查 `dist` 中 110 张商品图片。
- [ ] 使用 `GITHUB_REPOSITORY=qiuzhonggu/spend-elons-money npm run build` 构建，再通过 `GITHUB_REPOSITORY=qiuzhonggu/spend-elons-money npm run preview` 验证 `/spend-elons-money/` 子路径。
- [ ] 用应用内浏览器检查桌面端和移动端：购买、减购、撤销、随机豪购、采购包原子性、历史、收藏进度、顾问播报、刷新恢复与余额不足。
- [ ] 人为触发 1 次图片错误，确认本地占位图成功加载；检查页面无横向溢出、控制台错误和失败请求。
- [ ] 扫描生产产物，确认没有商品远程图片 URL。
- [ ] 审查 Git diff，提交并推送到 `main`。
- [ ] 等待 GitHub Actions 完成，检查公开页面和抽检本地图片返回 HTTP 200，并在线重跑购买、撤销与刷新恢复。
