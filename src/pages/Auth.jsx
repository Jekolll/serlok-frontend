// src/pages/Auth.jsx
import { useState } from "react"
import { api } from "../lib/api"
import { useStore } from "../lib/store"
import { Input, Btn } from "../components/ui"

export default function Auth() {
  const { saveAuth }  = useStore()
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ email: "", username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(""); setLoading(true)
    try {
      const res = mode === "login"
        ? await api.login(form.email, form.password)
        : await api.register(form.email, form.username, form.password)
      saveAuth(res.token, res.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981" opacity="0.8"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Serlok</h1>
          <p className="text-gray-500 text-sm mt-1">Lacak lokasi teman secara real-time</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5">
            {mode === "login" ? "Masuk ke akun" : "Buat akun baru"}
          </h2>

          <div className="flex flex-col gap-3">
            <Input label="Email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="kamu@email.com" autoComplete="email" />
            {mode === "register" && (
              <Input label="Username" value={form.username} onChange={v => set("username", v)} placeholder="username (min 3 karakter)" />
            )}
            <Input label="Password" type="password" value={form.password} onChange={v => set("password", v)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <Btn onClick={submit} disabled={loading} full className="mt-5">
            {loading ? "Loading..." : mode === "login" ? "Masuk" : "Daftar"}
          </Btn>

          <p className="text-center text-gray-500 text-xs mt-4">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
              className="text-emerald-400 hover:text-emerald-300">
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
