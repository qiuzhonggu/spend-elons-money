export const INITIAL_NET_WORTH = 1_100_000_000_000

export function createSpendingState(products, initialBalance = INITIAL_NET_WORTH) {
  return {
    products,
    initialBalance,
    quantities: {},
    notice: '',
  }
}

export function getQuantity(state, productId) {
  return state.quantities[productId] || 0
}

export function getSpent(state) {
  return state.products.reduce((total, product) => {
    return total + getQuantity(state, product.id) * product.price
  }, 0)
}

export function getRemaining(state) {
  return Math.max(0, state.initialBalance - getSpent(state))
}

export function getSpendPercent(state) {
  return Math.min(100, (getSpent(state) / state.initialBalance) * 100)
}

export function buyProduct(state, productId) {
  const product = state.products.find((item) => item.id === productId)
  if (!product) return false

  if (getRemaining(state) < product.price) {
    state.notice = `余额不足，买不起「${product.name}」了。`
    return false
  }

  state.quantities[productId] = getQuantity(state, productId) + 1
  state.notice = `已购买「${product.name}」。`
  return true
}

export function removeProduct(state, productId) {
  const quantity = getQuantity(state, productId)
  if (quantity <= 0) return false

  state.quantities[productId] = quantity - 1
  if (state.quantities[productId] === 0) {
    delete state.quantities[productId]
  }
  state.notice = '已减少一件商品。'
  return true
}
