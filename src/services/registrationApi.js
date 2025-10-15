import { fetchJSON } from './api.js'

export const PENDING_PAYMENT_KEY = 'pending_payment'

export function formatMssnId(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value
}
export function formatSurname(value) {
  return typeof value === 'string' ? value.replace(/\s{2,}/g, ' ').trim().toUpperCase() : value
}
export function normalizeField(input) {
  if (Array.isArray(input)) return input.filter(Boolean)
  if (typeof input === 'string') {
    const trimmed = input.trim()
    return trimmed.length ? trimmed : undefined
  }
  return input === undefined || input === null ? undefined : input
}

export function setPendingPayment(payload) {
  try { localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ ...payload, savedAt: Date.now() })) } catch {}
}
export function clearPendingPayment() { try { localStorage.removeItem(PENDING_PAYMENT_KEY) } catch {} }

export async function createNewRegistration(payload, { notifySuccess = false } = {}) {
  const res = await fetchJSON('/registration/new', {
    method: 'POST',
    body: JSON.stringify(payload),
    notifySuccess,
  })
  return res
}

export async function fetchExistingRegistration({ mssn_id, surname }) {
  const res = await fetchJSON('/registration/fetch', {
    method: 'POST',
    body: JSON.stringify({ mssn_id, surname }),
  })
  return res
}

export async function updateExistingRegistration(payload, { notifySuccess = false } = {}) {
  const res = await fetchJSON('/registration/existing', {
    method: 'POST',
    body: JSON.stringify(payload),
    notifySuccess,
  })
  return res
}

export async function searchMembers(paramsObj) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(paramsObj || {})) {
    if (v === undefined || v === null || v === '') continue
    params.set(k, String(v))
  }
  const res = await fetchJSON(`/search?${params.toString()}`)
  return res
}

export async function reprintSlip({ mssn_id, payment_ref }) {
  const res = await fetchJSON('/slip/reprint', {
    method: 'POST',
    body: JSON.stringify({ mssn_id, payment_ref }),
  })
  return res
}

export async function validatePayment(reference) {
  const res = await fetchJSON(`/payment/opay/callback?reference=${encodeURIComponent(reference)}`)
  return res
}
