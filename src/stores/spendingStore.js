import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import products from '../data/products.json'
import {
  getCategorySpend,
  getComparisonFacts,
  getFeaturedMission,
  getMilestoneState,
  getSpendingTitle,
  getSurpriseEvent,
  getUnlockedAchievements,
} from './gameCore'
import {
  BUNDLES,
  getAdvisorMessage,
  getAffordableProducts,
  getCollectionProgress,
  quoteBundle,
} from './gameplayCore'
import {
  INITIAL_NET_WORTH,
  applyQuantityChanges,
  createSpendingState,
  getQuantity,
  getRemaining,
  getSpendPercent,
  getSpent,
  restoreSpendingState,
  reverseQuantityChanges,
} from './spendingCore'

const STORAGE_KEY = 'spend-elons-money:v2'
const SNAPSHOT_VERSION = 2

function getStorage() {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

function readSnapshot() {
  try {
    const parsed = JSON.parse(getStorage()?.getItem(STORAGE_KEY) || 'null')
    return parsed?.version === SNAPSHOT_VERSION ? parsed : null
  } catch {
    return null
  }
}

function validHistory(history) {
  if (!Array.isArray(history)) return []
  return history.filter(
    (action) =>
      action &&
      Array.isArray(action.changes) &&
      action.changes.every(
        (change) =>
          products.some((product) => product.id === change.productId) &&
          Number.isInteger(change.quantity) &&
          change.quantity !== 0,
      ),
  ).slice(-20)
}

export const useSpendingStore = defineStore('spending', () => {
  const snapshot = readSnapshot()
  const state = ref(
    snapshot
      ? restoreSpendingState(products, INITIAL_NET_WORTH, snapshot)
      : createSpendingState(products, INITIAL_NET_WORTH),
  )
  const actionHistory = ref(validHistory(snapshot?.actionHistory))
  const spreeCount = ref(Number.isInteger(snapshot?.spreeCount) ? snapshot.spreeCount : 0)
  const latestPurchase = ref(null)
  const surpriseEvent = ref(null)

  const spent = computed(() => getSpent(state.value))
  const remaining = computed(() => getRemaining(state.value))
  const spendPercent = computed(() => getSpendPercent(state.value))
  const achievements = computed(() => getUnlockedAchievements(state.value))
  const featuredMission = computed(() => getFeaturedMission(state.value))
  const milestoneState = computed(() => getMilestoneState(state.value))
  const spendingTitle = computed(() => getSpendingTitle(state.value))
  const comparisonFacts = computed(() => getComparisonFacts(state.value))
  const categorySpend = computed(() => getCategorySpend(state.value))
  const collectionProgress = computed(() => getCollectionProgress(state.value))
  const advisorMessage = computed(() =>
    getAdvisorMessage({
      spent: spent.value,
      remaining: remaining.value,
      spreeCount: spreeCount.value,
      collected: collectionProgress.value.collected,
    }),
  )
  const purchasedItems = computed(() =>
    products
      .map((product) => ({ ...product, quantity: getQuantity(state.value, product.id) }))
      .filter((product) => product.quantity > 0)
      .sort((a, b) => b.quantity * b.price - a.quantity * a.price),
  )
  const totalItems = computed(() =>
    purchasedItems.value.reduce((total, product) => total + product.quantity, 0),
  )
  const isFinished = computed(() => remaining.value <= 0)

  function persist() {
    try {
      getStorage()?.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: SNAPSHOT_VERSION,
          quantities: state.value.quantities,
          actionHistory: actionHistory.value,
          spreeCount: spreeCount.value,
        }),
      )
    } catch {
      // Storage can be blocked in private browsing; gameplay should continue.
    }
  }

  function quantityFor(productId) {
    return getQuantity(state.value, productId)
  }

  function canBuy(product) {
    return remaining.value >= product.price
  }

  function executeAction(changes, { type, label }) {
    if (!applyQuantityChanges(state.value, changes)) return false

    const positiveCount = changes.reduce((total, change) => total + Math.max(0, change.quantity), 0)
    const total = changes.reduce((sum, change) => {
      const product = products.find((item) => item.id === change.productId)
      return sum + product.price * change.quantity
    }, 0)
    actionHistory.value.push({ id: `${Date.now()}-${actionHistory.value.length}`, type, label, changes, total, timestamp: Date.now() })
    actionHistory.value = actionHistory.value.slice(-20)

    if (positiveCount > 0) {
      spreeCount.value += positiveCount
      latestPurchase.value = products.find((item) => item.id === changes.find((change) => change.quantity > 0)?.productId) || null
      surpriseEvent.value = getSurpriseEvent(spreeCount.value)
    } else {
      spreeCount.value = 0
      surpriseEvent.value = null
    }

    state.value.notice = label
    persist()
    return true
  }

  function buy(productId) {
    const product = products.find((item) => item.id === productId)
    if (!product || !canBuy(product)) {
      state.value.notice = product ? `余额不足，买不起「${product.name}」了。` : '商品不存在。'
      return false
    }
    return executeAction([{ productId, quantity: 1 }], { type: 'buy', label: `已购买「${product.name}」。` })
  }

  function buyMany(productId, count) {
    const product = products.find((item) => item.id === productId)
    if (!product || !Number.isInteger(count) || count <= 0) return 0
    const quantity = Math.min(count, Math.floor(remaining.value / product.price))
    if (quantity <= 0) {
      state.value.notice = `余额不足，买不起「${product.name}」了。`
      return 0
    }
    return executeAction([{ productId, quantity }], {
      type: 'bulk',
      label: `一口气买下 ${quantity} 件「${product.name}」。`,
    }) ? quantity : 0
  }

  function buyMax(productId) {
    const product = products.find((item) => item.id === productId)
    return product ? buyMany(productId, Math.floor(remaining.value / product.price)) : 0
  }

  function remove(productId) {
    const product = products.find((item) => item.id === productId)
    if (!product || quantityFor(productId) <= 0) return false
    return executeAction([{ productId, quantity: -1 }], {
      type: 'remove',
      label: `已退回 1 件「${product.name}」。`,
    })
  }

  function buyRandom() {
    const candidates = getAffordableProducts(products, remaining.value)
    if (candidates.length === 0) {
      state.value.notice = '余额里已经没有买得起的商品了。'
      return false
    }
    return buy(candidates[Math.floor(Math.random() * candidates.length)].id)
  }

  function buyBundle(bundleId) {
    const bundle = BUNDLES.find((item) => item.id === bundleId)
    const quote = quoteBundle(bundle, products)
    if (!quote.valid) return false
    if (quote.total > remaining.value) {
      state.value.notice = `余额不足，无法一次买下「${bundle.name}」。`
      return false
    }
    return executeAction(bundle.items.map((item) => ({ ...item })), {
      type: 'bundle',
      label: `主题采购完成：「${bundle.name}」。`,
    })
  }

  function undoLast() {
    const action = actionHistory.value.at(-1)
    if (!action || !reverseQuantityChanges(state.value, action.changes)) return false
    actionHistory.value.pop()
    spreeCount.value = 0
    latestPurchase.value = null
    surpriseEvent.value = null
    state.value.notice = `已撤销：${action.label}`
    persist()
    return true
  }

  function reset() {
    state.value = createSpendingState(products, INITIAL_NET_WORTH)
    actionHistory.value = []
    spreeCount.value = 0
    latestPurchase.value = null
    surpriseEvent.value = null
    try {
      getStorage()?.removeItem(STORAGE_KEY)
    } catch {
      // Ignore unavailable storage.
    }
  }

  return {
    products,
    bundles: BUNDLES,
    state,
    spent,
    remaining,
    spendPercent,
    achievements,
    featuredMission,
    milestoneState,
    spendingTitle,
    comparisonFacts,
    categorySpend,
    collectionProgress,
    advisorMessage,
    purchasedItems,
    totalItems,
    isFinished,
    spreeCount,
    latestPurchase,
    surpriseEvent,
    actionHistory,
    quantityFor,
    canBuy,
    buy,
    buyMany,
    buyMax,
    remove,
    buyRandom,
    buyBundle,
    undoLast,
    reset,
  }
})
