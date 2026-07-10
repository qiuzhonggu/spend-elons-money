import { describe, expect, it } from 'vitest'
import {
  BUNDLES,
  getAdvisorMessage,
  getAffordableProducts,
  getCollectionProgress,
  quoteBundle,
} from './gameplayCore'
import { createSpendingState } from './spendingCore'

const products = [
  { id: 'phone', name: '手机', category: '电子产品', price: 100 },
  { id: 'car', name: '跑车', category: '汽车', price: 500 },
  { id: 'rocket', name: '火箭', category: '火箭航天', price: 1000 },
]

describe('gameplay core', () => {
  it('returns only affordable products', () => {
    expect(getAffordableProducts(products, 500).map((item) => item.id)).toEqual(['phone', 'car'])
  })

  it('quotes a bundle without mutating products', () => {
    const bundle = { id: 'starter', items: [{ productId: 'phone', quantity: 2 }, { productId: 'car', quantity: 1 }] }
    expect(quoteBundle(bundle, products)).toMatchObject({ total: 700, valid: true })
    expect(quoteBundle({ items: [{ productId: 'missing', quantity: 1 }] }, products).valid).toBe(false)
    expect(BUNDLES.length).toBeGreaterThanOrEqual(3)
  })

  it('measures category collection progress', () => {
    const state = createSpendingState(products, 5000)
    state.quantities.phone = 1
    state.quantities.rocket = 1
    expect(getCollectionProgress(state)).toEqual({ collected: 2, total: 3, percent: 66.7 })
  })

  it('changes advisor feedback with the game context', () => {
    expect(getAdvisorMessage({ spent: 0, remaining: 1000, spreeCount: 0, collected: 0 })).toContain('第一笔')
    expect(getAdvisorMessage({ spent: 900, remaining: 100, spreeCount: 12, collected: 3 })).toContain('刹车')
  })
})
