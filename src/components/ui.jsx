// src/components/ui.jsx
export const Btn = ({ children, onClick, variant = "primary", disabled, full, sm, className = "" }) => {
  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150
    disabled:opacity-40 disabled:cursor-not-allowed ${full ? "w-full" : ""} ${sm ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"} ${className}`
  const v = {
    primary: "bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black",
    danger:  "bg-red-600 hover:bg-red-500 active:scale-95 text-white",
    ghost:   "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300",
    outline: "border border-white/20 hover:border-white/40 text-gray-300 hover:text-white",
  }
  return <button className={`${base} ${v[variant]}`} onClick={onClick} disabled={disabled}>{children}</button>
}

export const Input = ({ label, type = "text", value, onChange, placeholder, hint, autoComplete }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-gray-400">{label}</label>}
    <input
      type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
      onChange={e => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600
        focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
    />
    {hint && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
)

export const Card = ({ children, className = "" }) => (
  <div className={`bg-[#111] border border-white/8 rounded-2xl p-4 ${className}`}>{children}</div>
)

export const Avatar = ({ username, color = "#10b981", size = "md", online }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-black`}
        style={{ background: color }}>
        {username?.[0]?.toUpperCase() || "?"}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${online ? "bg-emerald-500" : "bg-gray-600"}`} />
      )}
    </div>
  )
}

export const Spinner = ({ sm }) => (
  <div className={`${sm ? "w-3 h-3 border" : "w-4 h-4 border-2"} border-gray-600 border-t-emerald-400 rounded-full animate-spin`} />
)

export const Badge = ({ children, color = "gray" }) => {
  const c = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    red:   "bg-red-500/15 text-red-400 border-red-500/25",
    gray:  "bg-white/8 text-gray-400 border-white/10",
    blue:  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c[color]}`}>{children}</span>
}
