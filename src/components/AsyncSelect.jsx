import * as React from 'react'

function useOutsideClick(ref, handler) {
  React.useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

export default function AsyncSelect({
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  disabled = false,
  fetchPage,
  onBlur,
  invalid = false,
}) {
  const containerRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const prevOpen = React.useRef(false)

  const normalizedValue = multiple ? (Array.isArray(value) ? value.filter(Boolean) : []) : (value || '')
  const selectedLabels = React.useMemo(() => {
    if (multiple) return normalizedValue
    return normalizedValue ? [normalizedValue] : []
  }, [multiple, normalizedValue])

  const hasMore = page < totalPages

  const load = async (reset = false) => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const targetPage = reset ? 1 : page + (items.length ? 1 : 0)
      const res = await fetchPage({ page: targetPage, search: debouncedSearch.trim() })
      const newItems = res.items || []
      setItems((prev) => (reset ? newItems : [...prev, ...newItems]))
      setPage(res.page || targetPage)
      setTotalPages(res.totalPages || targetPage)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      setItems([])
      setPage(1)
      setTotalPages(1)
      load(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch])

  // Prefetch current value so the label is shown even if the dropdown hasn't been opened
  React.useEffect(() => {
    let mounted = true
    const ensureValueLoaded = async () => {
      try {
        if (disabled) return
        if (multiple) {
          const vals = Array.isArray(value) ? value.filter(Boolean) : []
          if (!vals.length) return
          const missing = vals.filter((v) => !items.some((it) => String(it.label) === String(v)))
          if (!missing.length) return
          const res = await fetchPage({ page: 1, search: missing.join(' ') })
          if (!mounted) return
          const newItems = res.items || []
          setItems((prev) => {
            const merged = [...prev]
            newItems.forEach((it) => {
              if (!merged.some((m) => String(m.label) === String(it.label))) merged.push(it)
            })
            return merged
          })
        } else {
          if (!value) return
          if (items.some((it) => String(it.label) === String(value))) return
          const res = await fetchPage({ page: 1, search: String(value) })
          if (!mounted) return
          const newItems = res.items || []
          setItems((prev) => {
            const merged = [...prev]
            newItems.forEach((it) => {
              if (!merged.some((m) => String(m.label) === String(it.label))) merged.push(it)
            })
            return merged
          })
        }
      } catch (_) {}
    }
    ensureValueLoaded()
    return () => {
      mounted = false
    }
  }, [value, multiple, disabled, fetchPage])

  React.useEffect(() => {
    if (prevOpen.current && !open) {
      onBlur?.()
    }
    prevOpen.current = open
  }, [open, onBlur])

  useOutsideClick(containerRef, () => setOpen(false))

  const onOptionClick = (opt) => {
    if (multiple) {
      const set = new Set(normalizedValue)
      if (set.has(opt.label)) set.delete(opt.label)
      else set.add(opt.label)
      onChange(Array.from(set))
      onBlur?.()
    } else {
      onChange(opt.label)
      setOpen(false)
    }
  }

  const isSelected = (opt) => {
    return multiple ? normalizedValue.includes(opt.label) : normalizedValue === opt.label
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 hover:border-mssn-green/40 focus:border-mssn-green focus:ring-mssn-green/25'} ${disabled ? 'cursor-not-allowed bg-mssn-mist text-mssn-slate/50' : 'bg-white text-mssn-slate'}`}
      >
        {selectedLabels.length ? (
          multiple ? (
            <span className="flex flex-wrap gap-1">
              {selectedLabels.map((l, i) => (
                <span key={i} className="rounded-xl bg-mssn-mist px-2 py-0.5 text-xs text-mssn-slate">{l}</span>
              ))}
            </span>
          ) : (
            <span>{selectedLabels[0]}</span>
          )
        ) : (
          <span className="text-mssn-slate/40">{placeholder}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-visible rounded-xl border border-mssn-slate/10 bg-white">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
            />
          </div>
          <div
            className="max-h-60 overflow-auto"
            onScroll={(e) => {
              const el = e.currentTarget
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24 && hasMore && !loading) {
                load(false)
              }
            }}
          >
            {items.map((opt) => (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => onOptionClick(opt)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-mssn-mist ${isSelected(opt) ? 'bg-mssn-mist' : ''}`}
              >
                <span>{opt.label}</span>
                {isSelected(opt) && <span className="text-mssn-greenDark">✓</span>}
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-xs text-mssn-slate/60">Loading…</div>}
            {!loading && !items.length && <div className="px-3 py-6 text-center text-xs text-mssn-slate/60">No results</div>}
          </div>
        </div>
      )}
    </div>
  )
}
