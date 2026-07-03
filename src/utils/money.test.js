import { describe, expect, it } from 'vitest'
import { formatCompactCurrency, formatCurrency } from './money'

describe('money formatting', () => {
  it('formats full currency with thousands separators', () => {
    expect(formatCurrency(1100000000000)).toBe('$1,100,000,000,000')
  })

  it('formats compact currency using K/M/B/T suffixes', () => {
    expect(formatCompactCurrency(1250)).toBe('$1.25K')
    expect(formatCompactCurrency(4500000)).toBe('$4.5M')
    expect(formatCompactCurrency(1100000000000)).toBe('$1.1T')
    expect(formatCompactCurrency(2500000000000)).toBe('$2.5T')
  })
})
