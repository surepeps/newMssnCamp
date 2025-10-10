import { fetchJSON } from './api.js'

const cacheStore = {
  ailments: new Map(),
  councils: new Map(),
  schools: new Map(),
  classLevels: new Map()
}

function buildCacheKey(namespace, params) {
  return `${namespace}:${JSON.stringify(params)}`
}

async function cachedResponse(cache, key, loader) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const pending = loader()
  cache.set(key, pending)
  try {
    const result = await pending
    cache.set(key, result)
    return result
  } catch (error) {
    cache.delete(key)
    throw error
  }
}

// Generic helpers returning { items, page, totalPages }
export async function queryAilments({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('ailments', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse(cacheStore.ailments, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('ailment_name', rawSearch)
    const res = await fetchJSON(`/basic-needs/ailments?${params.toString()}`)
    const records = res?.data?.records || []
    const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
    return { items: records.map((r) => ({ value: r.ailment_id, label: r.ailment_name })), page: pg.page, totalPages: pg.totalPages }
  })
}

export async function queryCouncils({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('councils', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse(cacheStore.councils, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('councilName', rawSearch)
    const res = await fetchJSON(`/basic-needs/councils?${params.toString()}`)
    const records = res?.data?.records || []
    const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
    return { items: records.map((r) => ({ value: String(r.councilID), label: r.councilName })), page: pg.page, totalPages: pg.totalPages }
  })
}

export async function querySchools({ identifier = 'S', page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('schools', { identifier, page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse(cacheStore.schools, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit), school_identifier: identifier })
    if (rawSearch) params.set('school_name', rawSearch)
    const res = await fetchJSON(`/basic-needs/schools?${params.toString()}`)
    const records = res?.data?.records || []
    const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
    return { items: records.map((r) => ({ value: r.school_id, label: r.school_name })), page: pg.page, totalPages: pg.totalPages }
  })
}

export async function queryClassLevels({ identifier = 'S', page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('class-levels', { identifier, page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse(cacheStore.classLevels, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit), class_identifier: identifier })
    if (rawSearch) params.set('class_name', rawSearch)
    const res = await fetchJSON(`/basic-needs/class-levels?${params.toString()}`)
    const records = res?.data?.records || []
    const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
    return { items: records.map((r) => ({ value: r.class_id, label: r.class_name })), page: pg.page, totalPages: pg.totalPages }
  })
}

export async function fetchStates() {
  const states = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT Abuja'
  ]
  return states.map((s) => ({ value: s, label: s }))
}

export async function fetchMaritalStatuses() {
  return [{ value: 'Single', label: 'Single' }]
}

export async function fetchCourses() {
  return []
}

export async function fetchHighestQualifications() {
  return []
}

export async function fetchAilments({ page = 1, limit = 100, search = '' } = {}) {
  const { items } = await queryAilments({ page, limit, search })
  return items
}

export async function fetchCouncils({ page = 1, limit = 200, search = '' } = {}) {
  const { items } = await queryCouncils({ page, limit, search })
  return items
}

export async function fetchBranches(/* councilId */) {
  return []
}

export async function fetchSchoolsSecondary({ page = 1, limit = 200, search = '' } = {}) {
  const { items } = await querySchools({ identifier: 'S', page, limit, search })
  return items
}

export async function fetchSchoolsUndergrad({ page = 1, limit = 200, search = '' } = {}) {
  const { items } = await querySchools({ identifier: 'U', page, limit, search })
  return items
}

export async function fetchClassLevels(category) {
  const id = category === 'Secondary' ? 'S' : category === 'Undergraduate' ? 'U' : 'O'
  const { items } = await queryClassLevels({ identifier: id, page: 1, limit: 200 })
  return items
}
