// src/components/FriendsPanel.jsx
import { useState } from "react"
import { api } from "../lib/api"
import { Avatar, Btn, Input } from "./ui"

export default function FriendsPanel({ friends, requests, onClose, onFlyTo, onReload }) {
  const [tab,     setTab]     = useState("friends") // friends | requests | add
  const [query,   setQuery]   = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState("")

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.searchUsers(query)
      setResults(res)
    } catch {}
    finally { setLoading(false) }
  }

  const addFriend = async (username) => {
    try {
      const res = await api.addFriend(username)
      setMsg(res.msg)
      setTimeout(() => setMsg(""), 3000)
    } catch (e) { setMsg(e.message) }
  }

  const accept = async (id) => {
    await api.acceptFriend(id)
    onReload()
  }

  const remove = async (id) => {
    if (!confirm("Hapus teman ini?")) return
    await api.removeFriend(id)
    onReload()
  }

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0f0f0f] border-l border-white/8 z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/8">
        <h2 className="font-bold text-white">Teman</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8">
        {[["friends","Teman"], ["requests","Permintaan"], ["add","Tambah"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all relative ${tab === t ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"}`}>
            {label}
            {t === "requests" && requests.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{requests.length}</span>
            )}
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* Tab: Daftar teman */}
        {tab === "friends" && (
          friends.length === 0
            ? <p className="text-gray-500 text-sm text-center py-8">Belum ada teman — tambah dulu!</p>
            : friends.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/6 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <Avatar username={f.username} color={f.avatar_color} online={f.is_online} />
                  <div>
                    <p className="text-sm font-medium text-white">{f.username}</p>
                    <p className={`text-xs ${f.is_online ? "text-emerald-400" : "text-gray-500"}`}>
                      {f.is_online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {f.is_online && (
                    <button onClick={() => { onFlyTo(f.id); onClose() }}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Lihat lokasi">
                      📍
                    </button>
                  )}
                  <button onClick={() => remove(f.friendship_id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus teman">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
        )}

        {/* Tab: Permintaan masuk */}
        {tab === "requests" && (
          requests.length === 0
            ? <p className="text-gray-500 text-sm text-center py-8">Tidak ada permintaan masuk</p>
            : requests.map(r => (
              <div key={r.friendship_id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/6">
                <div className="flex items-center gap-3">
                  <Avatar username={r.username} color={r.avatar_color} />
                  <p className="text-sm font-medium text-white">{r.username}</p>
                </div>
                <div className="flex gap-2">
                  <Btn variant="primary" sm onClick={() => accept(r.friendship_id)}>✓</Btn>
                  <Btn variant="danger"  sm onClick={() => remove(r.friendship_id)}>✕</Btn>
                </div>
              </div>
            ))
        )}

        {/* Tab: Tambah teman */}
        {tab === "add" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search()}
                placeholder="Cari username..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60"
              />
              <Btn onClick={search} disabled={loading} sm>Cari</Btn>
            </div>

            {msg && (
              <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                {msg}
              </div>
            )}

            {results.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/6 mb-2">
                <div className="flex items-center gap-3">
                  <Avatar username={u.username} color={u.avatar_color} />
                  <p className="text-sm font-medium text-white">{u.username}</p>
                </div>
                <Btn variant="primary" sm onClick={() => addFriend(u.username)}>+ Add</Btn>
              </div>
            ))}

            {results.length === 0 && query && !loading && (
              <p className="text-gray-500 text-xs text-center py-4">Tidak ada hasil untuk "{query}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
