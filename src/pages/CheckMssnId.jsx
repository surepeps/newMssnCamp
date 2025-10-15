import { useEffect, useMemo, useState } from 'react'
import AsyncSelect from '../components/AsyncSelect.jsx'
import { searchMembers } from '../services/registrationApi.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { navigate } from '../utils/navigation.js'
import { queryCouncils, queryClassLevels } from '../services/dataProvider.js'

const CATEGORY_OPTIONS = ['TFL', 'SECONDARY', 'UNDERGRADUATE', 'OTHERS']
const GENDER_OPTIONS = ['Male', 'Female']
const STORAGE_KEY = 'check_mssn_id_state'

function Field({ label, children, htmlFor, error }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
          {label}
        </label>
        {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function CheckMssnId() {
  const { settings } = useSettings()
  const currentCampCode = settings?.current_camp?.camp_code || ''

  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [category, setCategory] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [areaCouncil, setAreaCouncil] = useState('')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 })

  // Load saved state once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved && typeof saved === 'object') {
        if (typeof saved.search === 'string') setSearch(saved.search)
        if (typeof saved.gender === 'string') setGender(saved.gender)
        if (typeof saved.category === 'string') setCategory(saved.category)
        if (typeof saved.classLevel === 'string') setClassLevel(saved.classLevel)
        if (typeof saved.areaCouncil === 'string') setAreaCouncil(saved.areaCouncil)
        if (typeof saved.page === 'number') setPage(saved.page)
        if (typeof saved.limit === 'number') setLimit(saved.limit)
        // Only restore previously fetched rows if both mandatory fields were present
        if (Array.isArray(saved.rows) && saved.search && saved.areaCouncil) setRows(saved.rows)
        if (saved.pagination && typeof saved.pagination === 'object' && saved.search && saved.areaCouncil) setPagination(saved.pagination)
      }
    } catch {}
  }, [])

  const debouncedSearch = useDebounced(search, 500)

  const classIdentifier = useMemo(() => {
    const cat = String(category || '').toUpperCase()
    if (cat === 'SECONDARY') return 'S'
    if (cat === 'UNDERGRADUATE') return 'U'
    if (cat === 'TFL') return 'T'
    return 'O'
  }, [category])

  useEffect(() => {
    setClassLevel('')
  }, [classIdentifier])

  const canSearch = useMemo(() => {
    return Boolean((debouncedSearch || '').trim() && areaCouncil)
  }, [debouncedSearch, areaCouncil])

  const fetchData = async (opts = {}) => {
    const nextPage = opts.page || page
    const nextLimit = opts.limit || limit
    const q = (debouncedSearch || '').trim()
    if (!q || !areaCouncil) {
      // Do not perform any search unless both mandatory fields are present
      setRows([])
      setPagination({ total: 0, totalPages: 1, page: 1, limit: nextLimit })
      setPage(1)
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (gender) params.set('gender', gender.toLowerCase())
      if (classLevel) params.set('class_level', classLevel)
      if (areaCouncil) params.set('area_council', areaCouncil)
      if (category) params.set('pin_category', String(category).toUpperCase())
      params.set('page', String(nextPage))
      params.set('limit', String(nextLimit))

      const res = await searchMembers({
        search: debouncedSearch.trim(),
        gender: gender ? gender.toLowerCase() : undefined,
        class_level: classLevel || undefined,
        area_council: areaCouncil || undefined,
        pin_category: category ? String(category).toUpperCase() : undefined,
        page: String(nextPage),
        limit: String(nextLimit),
      })
      const data = Array.isArray(res?.data) ? res.data : []
      const p = res?.pagination || { total: data.length, page: nextPage, totalPages: nextPage, limit: nextLimit }
      const nextPg = { total: Number(p.total || 0), totalPages: Number(p.totalPages || 1), page: Number(p.page || nextPage), limit: Number(p.limit || nextLimit) }
      setRows(data)
      setPagination(nextPg)
      setPage(nextPg.page)
      setLimit(nextPg.limit)
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            search,
            gender,
            category,
            classLevel,
            areaCouncil,
            page: nextPg.page,
            limit: nextPg.limit,
            rows: data,
            pagination: nextPg,
          })
        )
      } catch {}
    } catch (err) {
      setError(err?.message || 'Failed to load results')
      setRows([])
      setPagination({ total: 0, totalPages: 1, page: 1, limit })
    } finally {
      setLoading(false)
    }
  }

  // Auto fetch when filters change (except page/limit handled by controls)
  useEffect(() => {
    if ((debouncedSearch || '').trim() && areaCouncil) {
      fetchData({ page: 1, limit })
    } else {
      // clear results if mandatory fields are missing
      setRows([])
      setPagination({ total: 0, totalPages: 1, page: 1, limit })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, gender, category, classLevel, areaCouncil, limit])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchData({ page: 1, limit })
  }

  const canPrev = page > 1
  const canNext = page < pagination.totalPages

  const genderFetch = async ({ page: pg = 1, search: s = '' }) => {
    const q = (s || '').toLowerCase()
    const all = GENDER_OPTIONS
      .filter((g) => g.toLowerCase().includes(q))
      .map((label, idx) => ({ value: idx + 1, label }))
    return { items: all, page: 1, totalPages: 1 }
  }

  const categoryFetch = async ({ page: pg = 1, search: s = '' }) => {
    const q = (s || '').toLowerCase()
    const all = CATEGORY_OPTIONS
      .filter((c) => c.toLowerCase().includes(q))
      .map((label, idx) => ({ value: idx + 1, label }))
    return { items: all, page: 1, totalPages: 1 }
  }

  const councilsFetch = async ({ page: pg = 1, search: s = '' }) => {
    const { items, page: p, totalPages } = await queryCouncils({ page: pg, limit: 20, search: s })
    return { items, page: p, totalPages }
  }

  const classLevelsFetch = async ({ page: pg = 1, search: s = '' }) => {
    const { items, page: p, totalPages } = await queryClassLevels({ identifier: classIdentifier, page: pg, limit: 20, search: s })
    return { items, page: p, totalPages }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="overflow-visible rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Check MSSN ID</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Search registered members</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">Filter by details to find a member and continue registration if eligible.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm font-semibold text-mssn-greenDark transition hover:text-mssn-green"
            >
              Back to home
            </button>
          </div>
        </div>

        <form className="space-y-8 px-6 pb-8 pt-6 sm:px-8" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Search by name, email or MSSN ID" htmlFor="search">
                <input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full rounded-xl border border-mssn-slate/20 bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:border-mssn-green focus:ring-2 focus:ring-mssn-green/25"
                />
              </Field>
              <Field label="Gender">
                <AsyncSelect value={gender} onChange={setGender} placeholder="Select gender" fetchPage={genderFetch} />
              </Field>
              <Field label="Category">
                <AsyncSelect value={category} onChange={setCategory} placeholder="Select category" fetchPage={categoryFetch} />
              </Field>
              <Field label="Class level">
                <AsyncSelect value={classLevel} onChange={setClassLevel} placeholder="Select class level" fetchPage={classLevelsFetch} disabled={!category} />
              </Field>
              <Field label="Area council">
                <AsyncSelect value={areaCouncil} onChange={setAreaCouncil} placeholder="Select council" fetchPage={councilsFetch} />
              </Field>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">Results per page</label>
                </div>
                <select
                  value={limit}
                  onChange={(e) => { const l = Number(e.target.value)||10; setLimit(l); setPage(1); fetchData({ page: 1, limit: l }) }}
                  className="mt-2 w-full rounded-xl border border-mssn-slate/20 bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:border-mssn-green focus:ring-2 focus:ring-mssn-green/25"
                >
                  {[10,20,50,100].map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSearch || loading}
                className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${!canSearch || loading ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-mssn-green cursor-pointer text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'}`}
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setGender(''); setCategory(''); setClassLevel(''); setAreaCouncil(''); setPage(1); try{localStorage.removeItem(STORAGE_KEY)}catch{}; setRows([]); setPagination({ total: 0, totalPages: 1, page: 1, limit }) }}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl border border-mssn-slate/20 px-8 py-3 text-sm font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark"
              >
                Clear
              </button>
            </div>
            {!canSearch ? (
              <div className="mt-3 text-sm text-mssn-slate/70">Please enter a name, email or MSSN ID and select an area council to enable search.</div>
            ) : null}
          </form>
      </div>

      {canSearch ? (
      <div className="mt-8 overflow-visible rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="border-b border-mssn-slate/10 px-6 py-4 sm:px-8">
          <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-mssn-green">Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-mssn-slate/10">
            <thead className="bg-mssn-mist/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Surname</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Firstname</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">MSSN ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Class level</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Area council</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-mssn-slate/60">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mssn-slate/10 bg-white">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-6 text-center text-sm text-mssn-slate/60">Loading…</td></tr>
              ) : rows.length ? (
                rows.map((r, idx) => {
                  const cat = r.pin_category || r.pin_cat || ''
                  const sameCamp = currentCampCode && r.camp_code && String(currentCampCode).toUpperCase() === String(r.camp_code).toUpperCase()
                  return (
                    <tr key={`${r.mssn_id}-${idx}`} className="hover:bg-mssn-mist/40">
                      <td className="px-6 py-3 text-sm">{r.surname}</td>
                      <td className="px-6 py-3 text-sm">{r.firstname}</td>
                      <td className="px-6 py-3 text-sm font-mono">{r.mssn_id}</td>
                      <td className="px-6 py-3 text-sm">{cat}</td>
                      <td className="px-6 py-3 text-sm">{r.class_level}</td>
                      <td className="px-6 py-3 text-sm">{r.area_council}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          disabled={sameCamp}
                          onClick={() => navigate(`/existing/edit?mssnId=${encodeURIComponent(r.mssn_id)}&surname=${encodeURIComponent(r.surname || '')}`)}
                          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${sameCamp ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-mssn-green text-white hover:bg-mssn-greenDark'}`}
                          title={sameCamp ? 'Already registered for current camp' : 'Continue to registration'}
                        >
                          {sameCamp ? 'Registered' : 'Register'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="7" className="px-6 py-6 text-center text-sm text-mssn-slate/60">No results found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-mssn-slate/10 px-6 py-4 sm:px-8">
          <div className="text-sm text-mssn-slate/70">Page {pagination.page} of {pagination.totalPages} • {pagination.total.toLocaleString()} results</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev || loading}
              onClick={() => fetchData({ page: page - 1, limit })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!canPrev || loading ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'border border-mssn-green/40 text-mssn-greenDark hover:bg-mssn-green/10'}`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canNext || loading}
              onClick={() => fetchData({ page: page + 1, limit })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!canNext || loading ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-mssn-green text-white hover:bg-mssn-greenDark'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      ) : (
      <div className="mt-8 overflow-visible rounded-3xl border border-mssn-slate/10 bg-white px-6 py-8 text-center">
        <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-mssn-green">Results</h2>
        <div className="mt-4 text-sm text-mssn-slate/70">No data will be shown until you enter a name, email or MSSN ID and select an area council.</div>
      </div>
      )}
    </section>
  )
}
