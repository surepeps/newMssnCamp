export default function StepProgress({ steps, current }) {
  return (
    <div className="w-full">
      <ol className="relative flex items-center justify-between gap-3">
        {steps.map((label, idx) => {
          const done = idx < current
          const active = idx === current
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ring-2 ${
                    active
                      ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white ring-mssn-green/40'
                      : done
                      ? 'bg-mssn-green/10 text-mssn-greenDark ring-mssn-green/30'
                      : 'bg-white text-mssn-slate ring-mssn-slate/20'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {idx + 1}
                </span>
                <span className={`truncate text-sm font-semibold ${active ? 'text-mssn-slate' : 'text-mssn-slate/70'}`}>{label}</span>
              </div>
              {idx !== steps.length - 1 && (
                <div className={`mx-3 h-[2px] flex-1 ${done ? 'bg-mssn-green/40' : 'bg-mssn-slate/20'}`} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
