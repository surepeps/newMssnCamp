export function isValidDate(value) {
  if (!value) return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}

export function isRegistrationOpen(camp) {
  if (!camp) return false
  const now = new Date()
  const hasStart = isValidDate(camp.registration_start)
  const hasEnd = isValidDate(camp.registration_end)
  const startOk = hasStart ? now >= new Date(camp.registration_start) : true
  const endOk = hasEnd ? now <= new Date(camp.registration_end) : true
  return startOk && endOk
}

export function getCategoryInfo({ camp, discountsMap, categoryKey }) {
  // categoryKey should be one of: 'tfl','secondary','undergraduate','others'
  if (!camp || !categoryKey) return null
  const original = camp.prices?.[categoryKey]
  // discount price from camp.discounts like price_und, price_sec
  const priceKeyMap = {
    tfl: 'price_tfl',
    secondary: 'price_sec',
    undergraduate: 'price_und',
    others: 'price_oth'
  }
  const discKey = priceKeyMap[categoryKey]
  const discounted = camp.discounts?.[discKey]

  const deadline = isValidDate(camp.discounts?.deadline) ? new Date(camp.discounts.deadline) : null
  const now = new Date()
  const discountActive = deadline ? now <= deadline : true // if no deadline, assume active

  const origNum = original == null ? null : Number(original)
  const discNum = discounted == null ? null : Number(discounted)
  const final = (discountActive && discNum != null && origNum != null && discNum < origNum) ? discounted : original

  const quota = Number.isFinite(Number(camp.quotas?.[categoryKey])) ? Number(camp.quotas[categoryKey]) : null
  const used = discountsMap && discountsMap[categoryKey] && Number.isFinite(Number(discountsMap[categoryKey].registered_count)) ? Number(discountsMap[categoryKey].registered_count) : 0
  const remaining = quota == null ? null : Math.max(0, quota - used)

  return {
    original,
    discounted,
    final,
    discountActive,
    deadline,
    quota,
    used,
    remaining,
  }
}
