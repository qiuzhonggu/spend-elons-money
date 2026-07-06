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
  INITIAL_NET_WORTH,
  buyProduct,
  createSpendingState,
  getQuantity,
  getRemaining,
  getSpendPercent,
  getSpent,
  removeProduct,
} from './spendingCore'

export const useSpendingStore = defineStore('spending', () => {
  const state = ref(createSpendingState(products, INITIAL_NET_WORTH))
  const spreeCount = ref(0)
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
  const purchasedItems = computed(() =>
    products
      .map((product) => ({
        ...product,
        quantity: getQuantity(state.value, product.id),
      }))
      .filter((product) => product.quantity > 0)
      .sort((a, b) => b.quantity * b.price - a.quantity * a.price),
  )
  const totalItems = computed(() =>
    purchasedItems.value.reduce((total, product) => total + product.quantity, 0),
  )
  const isFinished = computed(() => remaining.value <= 0)

  function quantityFor(productId) {
    return getQuantity(state.value, productId)
  }

  function canBuy(product) {
    return remaining.value >= product.price
  }

  function buy(productId) {
    const wasPurchased = buyProduct(state.value, productId)
    if (wasPurchased) {
      const product = products.find((item) => item.id === productId)
      spreeCount.value += 1
      latestPurchase.value = product
      surpriseEvent.value = getSurpriseEvent(spreeCount.value)
    }
    return wasPurchased
  }

  function buyMany(productId, count) {
    let purchased = 0
    for (let index = 0; index < count; index += 1) {
      if (!buy(productId)) break
      purchased += 1
    }
    return purchased
  }

  function buyMax(productId) {
    const product = products.find((item) => item.id === productId)
    if (!product) return 0
    const affordableCount = Math.floor(remaining.value / product.price)
    return buyMany(productId, affordableCount)
  }

  function remove(productId) {
    spreeCount.value = 0
    return removeProduct(state.value, productId)
  }

  function reset() {
    state.value = createSpendingState(products, INITIAL_NET_WORTH)
    spreeCount.value = 0
    latestPurchase.value = null
    surpriseEvent.value = null
  }

  return {
    products,
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
    purchasedItems,
    totalItems,
    isFinished,
    spreeCount,
    latestPurchase,
    surpriseEvent,
    quantityFor,
    canBuy,
    buy,
    buyMany,
    buyMax,
    remove,
    reset,
  }
})
