import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import products from '../data/products.json'
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

  const spent = computed(() => getSpent(state.value))
  const remaining = computed(() => getRemaining(state.value))
  const spendPercent = computed(() => getSpendPercent(state.value))
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
    return buyProduct(state.value, productId)
  }

  function remove(productId) {
    return removeProduct(state.value, productId)
  }

  function reset() {
    state.value = createSpendingState(products, INITIAL_NET_WORTH)
  }

  return {
    products,
    state,
    spent,
    remaining,
    spendPercent,
    purchasedItems,
    totalItems,
    isFinished,
    quantityFor,
    canBuy,
    buy,
    remove,
    reset,
  }
})
