import { getQuantity, getSpent } from './spendingCore'

export const ACHIEVEMENTS = [
  { id: 'first-buy', title: '第一笔豪购', description: '买下任意 1 件商品。' },
  { id: 'bulk-buyer', title: '批发式快乐', description: '同一种商品买到 10 件。' },
  { id: 'aviation-baron', title: '天空收藏家', description: '买下至少 1 架私人飞机类商品。' },
  { id: 'club-owner', title: '球队老板', description: '买下至少 1 个体育俱乐部。' },
  { id: 'rocket-dreamer', title: '轨道野心', description: '投资至少 1 个火箭航天项目。' },
  { id: 'ten-billion', title: '百亿开胃菜', description: '累计消费超过 100 亿美元。' },
]

export const MISSIONS = [
  { id: 'sports-club', title: '体育帝国', description: '买下任意体育俱乐部。', category: '体育俱乐部' },
  { id: 'rocket-mood', title: '点火倒计时', description: '买下任意火箭航天项目。', category: '火箭航天' },
  { id: 'air-route', title: '私人航线', description: '买下任意私人飞机。', category: '私人飞机' },
  { id: 'art-wall', title: '美术馆墙面', description: '买下任意艺术收藏。', category: '艺术收藏' },
  { id: 'island-weekend', title: '岛屿周末', description: '买下任意私人岛屿。', category: '岛屿' },
]

const MILESTONES = [
  { label: '100 亿美元', amount: 10_000_000_000 },
  { label: '1000 亿美元', amount: 100_000_000_000 },
  { label: '5000 亿美元', amount: 500_000_000_000 },
  { label: '1 万亿美元', amount: 1_000_000_000_000 },
]

const TITLES = [
  { label: '热身购物者', min: 0 },
  { label: '豪宅巡游者', min: 1_000_000_000 },
  { label: '轨道级玩家', min: 30_000_000_000 },
  { label: '星际预算官', min: 300_000_000_000 },
  { label: '银河采购总监', min: 1_000_000_000_000 },
]

export function getPurchasedCount(state) {
  return Object.values(state.quantities).reduce((total, quantity) => total + quantity, 0)
}

export function getCategorySpend(state) {
  const totals = state.products.reduce((result, product) => {
    const quantity = getQuantity(state, product.id)
    if (quantity > 0) {
      result[product.category] = (result[product.category] || 0) + quantity * product.price
    }
    return result
  }, {})

  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

function hasCategoryPurchase(state, category) {
  return state.products.some((product) => product.category === category && getQuantity(state, product.id) > 0)
}

export function getUnlockedAchievements(state) {
  const spent = getSpent(state)
  const maxSameProduct = Math.max(0, ...Object.values(state.quantities))
  const purchasedCount = getPurchasedCount(state)

  return ACHIEVEMENTS.filter((achievement) => {
    if (achievement.id === 'first-buy') return purchasedCount > 0
    if (achievement.id === 'bulk-buyer') return maxSameProduct >= 10
    if (achievement.id === 'aviation-baron') return hasCategoryPurchase(state, '私人飞机')
    if (achievement.id === 'club-owner') return hasCategoryPurchase(state, '体育俱乐部')
    if (achievement.id === 'rocket-dreamer') return hasCategoryPurchase(state, '火箭航天')
    if (achievement.id === 'ten-billion') return spent >= 10_000_000_000
    return false
  })
}

export function getFeaturedMission(state) {
  return MISSIONS.find((mission) => !hasCategoryPurchase(state, mission.category)) || {
    id: 'victory-lap',
    title: '全品类制霸',
    description: '继续把购物车推向更离谱的方向。',
    category: '全部',
  }
}

export function getMilestoneState(state) {
  const spent = getSpent(state)
  const reached = MILESTONES.filter((milestone) => spent >= milestone.amount)
  const next = MILESTONES.find((milestone) => spent < milestone.amount) || MILESTONES.at(-1)
  const previousAmount = reached.at(-1)?.amount || 0
  const range = Math.max(1, next.amount - previousAmount)

  return {
    reached,
    next,
    progress: Math.min(100, ((spent - previousAmount) / range) * 100),
  }
}

export function getSpendingTitle(state) {
  const spent = getSpent(state)
  return TITLES.reduce((current, title) => (spent >= title.min ? title : current), TITLES[0])
}

export function getComparisonFacts(state) {
  const spent = getSpent(state)
  return [
    { label: '相当于多少架 Gulfstream G650ER', value: Math.floor(spent / 70_000_000) },
    { label: '相当于多少支 NBA 球队', value: Math.floor(spent / 3_500_000_000) },
    { label: '相当于多少次商业轨道发射', value: Math.floor(spent / 67_000_000) },
  ]
}

export function getSurpriseEvent(purchasedCount) {
  if (purchasedCount > 0 && purchasedCount % 7 === 0) {
    return {
      title: '购物热度上升',
      description: '你连续塞进购物车的速度让财富顾问开始深呼吸。',
    }
  }

  if (purchasedCount > 0 && purchasedCount % 13 === 0) {
    return {
      title: '董事会紧急会议',
      description: '有人问：为什么今天突然买了这么多火箭和岛？',
    }
  }

  return null
}
