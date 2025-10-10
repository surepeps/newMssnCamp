export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-white/85 backdrop-blur">
      <div className="w-full max-w-3xl px-6">
        <div className="mb-8 h-3 w-32 animate-pulse rounded-full bg-mssn-mist" />
        <div className="space-y-4 rounded-3xl border border-mssn-slate/10 bg-white p-6">
          <div className="h-6 w-64 animate-pulse rounded bg-mssn-mist" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-mssn-mist" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-mssn-slate/10 p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-mssn-mist" />
                <div className="mt-2 h-6 w-16 animate-pulse rounded bg-mssn-mist" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
