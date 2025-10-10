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
