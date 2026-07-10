import { describe, expect, it } from 'vitest'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
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

  it('uses a valid local WebP file for every product', () => {
    for (const product of products) {
      expect(product.image).toBe(`/products/${product.id}.webp`)
      expect(product.image).not.toMatch(/^https?:\/\//)

      const imagePath = resolve('public', product.image.slice(1))
      expect(statSync(imagePath).size).toBeGreaterThan(100)
      const header = readFileSync(imagePath).subarray(0, 12)
      expect(header.subarray(0, 4).toString()).toBe('RIFF')
      expect(header.subarray(8, 12).toString()).toBe('WEBP')
    }
  })
})
