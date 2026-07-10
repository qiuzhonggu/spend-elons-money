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

export function applyQuantityChanges(state, changes) {
  if (!Array.isArray(changes) || changes.length === 0) return false

  const totals = new Map()
  for (const change of changes) {
    if (!Number.isInteger(change.quantity) || change.quantity === 0) return false
    if (!state.products.some((product) => product.id === change.productId)) return false
    totals.set(change.productId, (totals.get(change.productId) || 0) + change.quantity)
  }

  let spendDelta = 0
  for (const [productId, quantity] of totals) {
    const nextQuantity = getQuantity(state, productId) + quantity
    if (nextQuantity < 0) return false
    const product = state.products.find((item) => item.id === productId)
    spendDelta += product.price * quantity
  }

  if (spendDelta > getRemaining(state)) return false

  for (const [productId, quantity] of totals) {
    const nextQuantity = getQuantity(state, productId) + quantity
    if (nextQuantity === 0) delete state.quantities[productId]
    else state.quantities[productId] = nextQuantity
  }
  return true
}

export function reverseQuantityChanges(state, changes) {
  return applyQuantityChanges(
    state,
    changes.map((change) => ({ ...change, quantity: -change.quantity })),
  )
}

export function restoreSpendingState(products, initialBalance, snapshot) {
  const state = createSpendingState(products, initialBalance)
  const quantities = snapshot?.quantities
  if (!quantities || typeof quantities !== 'object' || Array.isArray(quantities)) return state

  for (const product of products) {
    const quantity = quantities[product.id]
    if (!Number.isInteger(quantity) || quantity <= 0) continue
    applyQuantityChanges(state, [{ productId: product.id, quantity }])
  }
  state.notice = ''
  return state
}
