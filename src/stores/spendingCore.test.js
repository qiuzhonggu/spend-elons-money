import { describe, expect, it } from 'vitest'
import {
  buyProduct,
  createSpendingState,
  getRemaining,
  getSpendPercent,
  getSpent,
  getQuantity,
  removeProduct,
} from './spendingCore'

const products = [
  { id: 'phone', name: '旗舰手机', price: 1200 },
  { id: 'jet', name: '私人飞机', price: 65_000_000 },
]

describe('spending core', () => {
  it('buys and removes products while keeping balance in sync', () => {
    const state = createSpendingState(products, 5000)

    expect(buyProduct(state, 'phone')).toBe(true)
    expect(buyProduct(state, 'phone')).toBe(true)
    expect(getQuantity(state, 'phone')).toBe(2)
    expect(getSpent(state)).toBe(2400)
    expect(getRemaining(state)).toBe(2600)
    expect(getSpendPercent(state)).toBe(48)

    expect(removeProduct(state, 'phone')).toBe(true)
    expect(getQuantity(state, 'phone')).toBe(1)
    expect(getRemaining(state)).toBe(3800)
  })

  it('blocks purchases when the remaining balance is not enough', () => {
    const state = createSpendingState(products, 5000)

    expect(buyProduct(state, 'jet')).toBe(false)
    expect(getQuantity(state, 'jet')).toBe(0)
    expect(getSpent(state)).toBe(0)
    expect(state.notice).toContain('余额不足')
  })
})
