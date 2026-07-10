export function resolveProductImage(path, baseUrl = import.meta.env.BASE_URL) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}${path.replace(/^\//, '')}`
}

export function handleProductImageError(event, fallback) {
  const target = event.currentTarget
  if (target.dataset.fallbackApplied === 'true') return false
  target.dataset.fallbackApplied = 'true'
  target.src = fallback
  return true
}
