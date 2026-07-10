import { getQuantity } from './spendingCore'

export const BUNDLES = [
  {
    id: 'silicon-valley',
    name: '硅谷创始人套装',
    description: '顶配电脑、豪车和一枚卫星通信阵列。',
    items: [
      { productId: 'macbook-pro-max', quantity: 10 },
      { productId: 'tesla-model-s', quantity: 3 },
      { productId: 'satellite-terminal', quantity: 1 },
    ],
  },
  {
    id: 'weekend-escape',
    name: '周末失联套装',
    description: '私人飞机、游艇和一座加勒比小岛。',
    items: [
      { productId: 'gulfstream-g650', quantity: 1 },
      { productId: 'princess-yacht', quantity: 1 },
      { productId: 'small-private-island', quantity: 1 },
    ],
  },
  {
    id: 'space-boss',
    name: '轨道老板套装',
    description: '从发动机到商业发射，一次完成太空热身。',
    items: [
      { productId: 'rocket-engine', quantity: 4 },
      { productId: 'earth-observation-sat', quantity: 2 },
      { productId: 'falcon-launch', quantity: 1 },
    ],
  },
]

export function getAffordableProducts(products, remaining) {
  return products.filter((product) => product.price <= remaining)
}

export function quoteBundle(bundle, products) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  let total = 0
  const items = []

  for (const entry of bundle?.items || []) {
    const product = productMap.get(entry.productId)
    if (!product || !Number.isInteger(entry.quantity) || entry.quantity <= 0) {
      return { valid: false, total: 0, items: [] }
    }
    total += product.price * entry.quantity
    items.push({ ...entry, product })
  }

  return { valid: items.length > 0, total, items }
}

export function getCollectionProgress(state) {
  const categories = [...new Set(state.products.map((product) => product.category))]
  const collectedCategories = new Set(
    state.products
      .filter((product) => getQuantity(state, product.id) > 0)
      .map((product) => product.category),
  )
  const percent = categories.length ? Math.round((collectedCategories.size / categories.length) * 1000) / 10 : 0
  return { collected: collectedCategories.size, total: categories.length, percent }
}

export function getAdvisorMessage({ spent, remaining, spreeCount, collected }) {
  if (spent === 0) return '财富顾问：先完成第一笔豪购，数字才会开始有意思。'
  if (remaining <= spent * 0.15 || spreeCount >= 10) return '财富顾问：刹车已经拆掉了，现在只能优雅地继续。'
  if (collected >= 8) return '财富顾问：你的资产版图已经横跨地面、海洋和轨道。'
  if (spreeCount >= 5) return '财富顾问：连买节奏很漂亮，董事会正在假装没看见。'
  return '财富顾问：余额依旧顽强，建议把目光移向更昂贵的分类。'
}
