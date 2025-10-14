import * as React from 'react'

export default function WhatsAppWidget({ phone = '09056136396' }) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { id: 1, from: 'bot', text: 'Hi! 👋 How can we help you with your registration today?' },
  ])

  const modules = React.useMemo(() => ({
    Registration: ['Account creation', 'Incomplete form', 'Draft lost', 'Other'],
    Payment: ['Failed transaction', 'Pending payment', 'Refund', 'Other'],
    Profile: ['Update details', 'Upload photo', 'Other'],
    Technical: ['Bug report', 'App crash', 'Performance', 'Other'],
    Others: ['General inquiry']
  }), [])

  const [selectedModule, setSelectedModule] = React.useState(Object.keys(modules)[0])
  const [selectedTopic, setSelectedTopic] = React.useState(modules[Object.keys(modules)[0]][0])
  const [description, setDescription] = React.useState('')
  const listRef = React.useRef(null)

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }))
    }
  }, [open, messages])

  React.useEffect(() => {
    const topics = modules[selectedModule] || ['Other']
    setSelectedTopic((prev) => (topics.includes(prev) ? prev : topics[0]))
  }, [selectedModule, modules])

  const composeMessage = (includeHistory = true) => {
    const parts = []
    if (selectedModule) parts.push(`Issue: ${selectedModule}`)
    if (selectedTopic) parts.push(`Topic: ${selectedTopic}`)
    if (description && description.trim()) parts.push(`Description: ${description.trim()}`)
    if (includeHistory) {
      const userHistory = messages.filter((m) => m.from === 'user').map((m) => m.text).join('\n')
      if (userHistory) parts.push(`Previous messages:\n${userHistory}`)
    }
    return parts.join('\n') || 'Hello, I need support.'
  }

  const send = () => {
    const payload = composeMessage(true)
    const id = Date.now()
    setMessages((m) => [...m, { id, from: 'user', text: payload }])
    setDescription('')
    // Simulate bot reply
    setTimeout(() => {
      setMessages((m) => [...m, { id: id + 1, from: 'bot', text: "Thanks — we'll get back to you via WhatsApp or email shortly." }])
    }, 800)
  }

  const openWhatsApp = () => {
    const payload = composeMessage(true)
    const encoded = encodeURIComponent(payload)
    const sanitized = phone.replace(/[^0-9+]/g, '')
    const href = `https://wa.me/${sanitized.replace('+', '')}?text=${encoded}`
    window.open(href, '_blank', 'noopener')
  }

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-[1200]">
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="group flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 shadow-lg ring-1 ring-mssn-slate/10 hover:shadow-soft">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20.52 3.48A11.953 11.953 0 0012 1C6.477 1 1.73 4.924 1.1 10.06c-.19 1.35.02 2.8.6 4.12L1 23l8.96-2.38c1.28.35 2.64.53 4 .53 5.523 0 10.27-3.924 10.9-9.06.18-1.35-.04-2.8-.64-4.12zM12 19.5c-1.21 0-2.4-.18-3.54-.53l-.25-.08L4 21l1.1-3.06-.1-.28A8.964 8.964 0 013 10.06C3.66 6.02 7.48 3 12 3c2.57 0 5.03 1.02 6.87 2.87C20.97 7.77 22 10.32 22 12.94c0 4.95-4.03 8.56-10 8.56z"/></svg>
          </span>
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-sm font-semibold text-mssn-slate">Chat with support</span>
            <span className="text-xs text-mssn-slate/60">WhatsApp</span>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-6 z-[1200] w-[20rem] max-w-[94vw]">
          <div className="rounded-2xl border border-mssn-slate/10 bg-white shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-mssn-slate/10 px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white">W</span>
                <div className="text-sm font-semibold text-mssn-slate">Support</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { openWhatsApp(); }} className="text-xs text-mssn-slate/70 hover:text-mssn-slate">Open in WhatsApp</button>
                <button onClick={() => setOpen(false)} className="text-sm font-semibold text-mssn-slate">✕</button>
              </div>
            </div>

            <div className="p-3">
              <label className="text-xs text-mssn-slate/70">Select module</label>
              <select value={selectedModule} onChange={(e)=>setSelectedModule(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 px-3 py-2 text-sm">
                {Object.keys(modules).map((m)=> <option key={m} value={m}>{m}</option>)}
              </select>

              <label className="mt-2 text-xs text-mssn-slate/70">Issue</label>
              <select value={selectedTopic} onChange={(e)=>setSelectedTopic(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 px-3 py-2 text-sm">
                {(modules[selectedModule] || []).map((t)=> <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="mt-2 text-xs text-mssn-slate/70">Description</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Describe the issue or add details..." className="mt-1 w-full min-h-[64px] rounded-xl border border-mssn-slate/20 px-3 py-2 text-sm resize-y" />
            </div>

            <div ref={listRef} className="max-h-48 space-y-2 overflow-auto p-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === 'user' ? 'bg-mssn-green text-white' : 'bg-mssn-mist text-mssn-slate'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-mssn-slate/10 p-3">
              <button onClick={send} className="inline-flex items-center justify-center rounded-2xl bg-mssn-green px-3 py-2 text-sm font-semibold text-white">Send</button>
              <button onClick={openWhatsApp} className="inline-flex items-center justify-center rounded-2xl border border-mssn-slate/10 px-3 py-2 text-sm font-semibold text-mssn-slate">Open in WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
