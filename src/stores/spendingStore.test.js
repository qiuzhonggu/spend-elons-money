import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSpendingStore } from './spendingStore'

function createStorage() {
  const values = new Map()
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  }
}

describe('spending store gameplay actions', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage())
    setActivePinia(createPinia())
  })

  it('records a bulk purchase as one action and undoes it exactly', () => {
    const store = useSpendingStore()
    expect(store.buyMany('iphone-16-pro-max', 10)).toBe(10)
    expect(store.actionHistory).toHaveLength(1)
    expect(store.quantityFor('iphone-16-pro-max')).toBe(10)

    expect(store.undoLast()).toBe(true)
    expect(store.quantityFor('iphone-16-pro-max')).toBe(0)
  })

  it('undoes the latest remove by restoring its product', () => {
    const store = useSpendingStore()
    store.buy('iphone-16-pro-max')
    store.remove('iphone-16-pro-max')
    expect(store.quantityFor('iphone-16-pro-max')).toBe(0)

    store.undoLast()
    expect(store.quantityFor('iphone-16-pro-max')).toBe(1)
  })

  it('buys an affordable random product and leaves state unchanged without candidates', () => {
    const store = useSpendingStore()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(store.buyRandom()).toBe(true)
    const actions = store.actionHistory.length

    store.state.initialBalance = store.spent
    expect(store.buyRandom()).toBe(false)
    expect(store.actionHistory).toHaveLength(actions)
    expect(store.state.notice).toContain('买得起')
  })

  it('buys bundles atomically and rejects an unaffordable bundle', () => {
    const store = useSpendingStore()
    expect(store.buyBundle('silicon-valley')).toBe(true)
    expect(store.actionHistory).toHaveLength(1)

    const quantities = { ...store.state.quantities }
    store.state.initialBalance = store.spent
    expect(store.buyBundle('space-boss')).toBe(false)
    expect(store.state.quantities).toEqual(quantities)
  })

  it('restores a versioned snapshot and clears it on reset', () => {
    const firstStore = useSpendingStore()
    firstStore.buyMany('iphone-16-pro-max', 3)

    setActivePinia(createPinia())
    const restoredStore = useSpendingStore()
    expect(restoredStore.quantityFor('iphone-16-pro-max')).toBe(3)
    expect(restoredStore.actionHistory).toHaveLength(1)

    restoredStore.reset()
    expect(localStorage.removeItem).toHaveBeenCalled()
  })

  it('ignores damaged snapshots and storage failures', () => {
    localStorage.getItem.mockReturnValue('{bad json')
    localStorage.setItem.mockImplementation(() => { throw new Error('blocked') })

    expect(() => useSpendingStore()).not.toThrow()
    const store = useSpendingStore()
    expect(() => store.buy('iphone-16-pro-max')).not.toThrow()
  })
})
