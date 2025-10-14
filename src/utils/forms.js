export function applyServerErrorsToFormik(helpers, errorSource) {
  if (!helpers || typeof helpers.setFieldError !== 'function') return false
  const rawErrors = errorSource?.errors ?? errorSource
  if (!rawErrors || typeof rawErrors !== 'object') return false

  let applied = false
  for (const [field, value] of Object.entries(rawErrors)) {
    const messages = Array.isArray(value) ? value : [value]
    const firstMessage = messages
      .map((item) => (item == null ? '' : String(item)))
      .map((text) => text.trim())
      .find((text) => text.length > 0)

    if (firstMessage) {
      helpers.setFieldError(field, firstMessage)
      if (typeof helpers.setFieldTouched === 'function') {
        helpers.setFieldTouched(field, true, false)
      }
      applied = true
    }
  }

  return applied
}
