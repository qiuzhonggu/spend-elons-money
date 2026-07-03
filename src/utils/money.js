export function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

export function formatCompactCurrency(value) {
  const abs = Math.abs(value)
  const units = [
    { limit: 1_000_000_000_000, suffix: 'T' },
    { limit: 1_000_000_000, suffix: 'B' },
    { limit: 1_000_000, suffix: 'M' },
    { limit: 1_000, suffix: 'K' },
  ]
  const unit = units.find((item) => abs >= item.limit)

  if (!unit) return formatCurrency(value)

  const scaled = value / unit.limit
  const fractionDigits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
  return `$${scaled.toFixed(fractionDigits).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1')}${unit.suffix}`
}
