import { fetchJSON } from './api.js'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_ENTRIES = 300

const cacheStore = {
  ailments: new Map(), // key -> { data, expiresAt }
  councils: new Map(),
  schools: new Map(),
  classLevels: new Map(),
  states: new Map(),
  courses: new Map(),
}

const inflight = {
  ailments: new Map(), // key -> Promise
  councils: new Map(),
  schools: new Map(),
  classLevels: new Map(),
  states: new Map(),
  courses: new Map(),
}

function pruneCache(cache) {
  const now = Date.now()
  // Remove expired
  for (const [k, v] of cache.entries()) {
    if (!v || typeof v.expiresAt !== 'number' || v.expiresAt <= now) {
      cache.delete(k)
    }
  }
  // Bound size
  if (cache.size > MAX_CACHE_ENTRIES) {
    const removeCount = cache.size - MAX_CACHE_ENTRIES
    let i = 0
    for (const key of cache.keys()) {
      cache.delete(key)
      i += 1
      if (i >= removeCount) break
    }
  }
}

function buildCacheKey(namespace, params) {
  return `${namespace}:${JSON.stringify(params)}`
}

async function cachedResponse(namespace, cache, key, loader) {
  pruneCache(cache)
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && cached.expiresAt > now) {
    return cached.data
  }
  const inflightMap = inflight[namespace]
  if (inflightMap.has(key)) {
    return inflightMap.get(key)
  }
  const pending = loader().then((result) => {
    cache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
    inflightMap.delete(key)
    return result
  }).catch((err) => {
    inflightMap.delete(key)
    throw err
  })
  inflightMap.set(key, pending)
  return pending
}

// Generic helpers returning { items, page, totalPages }
export async function queryAilments({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('ailments', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('ailments', cacheStore.ailments, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('ailment_name', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/ailments?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: r.ailment_id, label: r.ailment_name })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
  })
}

export async function queryCouncils({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('councils', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('councils', cacheStore.councils, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('councilName', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/councils?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: String(r.councilID), label: r.councilName })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
  })
}

export async function querySchools({ identifier = 'S', page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('schools', { identifier, page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('schools', cacheStore.schools, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit), school_identifier: identifier })
    if (rawSearch) params.set('school_name', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/schools?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: r.school_id, label: r.school_name })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
  })
}

export async function queryClassLevels({ identifier = 'S', page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('class-levels', { identifier, page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('classLevels', cacheStore.classLevels, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit), class_identifier: identifier })
    if (rawSearch) params.set('class_name', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/class-levels?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: r.class_id, label: r.class_name })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
  })
}

export async function queryStates({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('states', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('states', cacheStore.states, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('state', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/states?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: r.state_id, label: r.state })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
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

export async function queryCourses({ page = 1, limit = 20, search = '' } = {}) {
  const normalizedPage = Number(page) || 1
  const normalizedLimit = Number(limit) || 20
  const rawSearch = (search || '').trim()
  const key = buildCacheKey('courses', { page: normalizedPage, limit: normalizedLimit, search: rawSearch.toLowerCase() })

  return cachedResponse('courses', cacheStore.courses, key, async () => {
    const params = new URLSearchParams({ page: String(normalizedPage), limit: String(normalizedLimit) })
    if (rawSearch) params.set('course_name', rawSearch)
    try {
      const res = await fetchJSON(`/basic-needs/courses?${params.toString()}`)
      const records = res?.data?.records || []
      const pg = res?.data?.pagination || { totalPages: normalizedPage, page: normalizedPage }
      return { items: records.map((r) => ({ value: r.course_id, label: r.course_name })), page: pg.page, totalPages: pg.totalPages }
    } catch (err) {
      return { items: [], page: normalizedPage, totalPages: normalizedPage }
    }
  })
}

export async function fetchCourses({ page = 1, limit = 200, search = '' } = {}) {
  const { items } = await queryCourses({ page, limit, search })
  return items
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
