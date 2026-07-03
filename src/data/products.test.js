import { describe, expect, it } from 'vitest'
import products from './products.json'

describe('products data', () => {
  it('contains at least 100 purchasable products across luxury categories', () => {
    expect(products.length).toBeGreaterThanOrEqual(100)
    expect([...new Set(products.map((product) => product.category))]).toEqual(
      expect.arrayContaining([
        '电子产品',
        '汽车',
        '豪宅',
        '游艇',
        '私人飞机',
        '火箭航天',
        '体育俱乐部',
        '岛屿',
        '艺术收藏',
      ]),
    )
  })
})
