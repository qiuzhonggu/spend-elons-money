import { describe, expect, it } from 'vitest'
import { handleProductImageError, resolveProductImage } from './productImage'

describe('product image helpers', () => {
  it('resolves product images against the deployment base', () => {
    expect(resolveProductImage('/products/phone.webp', '/spend-elons-money/')).toBe(
      '/spend-elons-money/products/phone.webp',
    )
    expect(resolveProductImage('/products/phone.webp', '/')).toBe('/products/phone.webp')
  })

  it('switches to a local fallback only once', () => {
    const target = { src: '/broken.webp', dataset: {} }
    expect(handleProductImageError({ currentTarget: target }, '/fallback.webp')).toBe(true)
    expect(target.src).toBe('/fallback.webp')
    expect(handleProductImageError({ currentTarget: target }, '/fallback.webp')).toBe(false)
  })
})
