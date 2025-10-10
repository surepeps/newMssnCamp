export function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

export function navigate(to, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, '', to)
  } else {
    window.history.pushState({}, '', to)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function createNavigationHandler(to, options) {
  return (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedEvent(event) ||
      (event.currentTarget instanceof HTMLAnchorElement && event.currentTarget.target === '_blank')
    ) {
      return
    }
    event.preventDefault()
    navigate(to, options)
  }
}
