// src/components/GroupsPanel.jsx
import { useState, useEffect } from "react"
import { api } from "../lib/api"
import { Avatar, Btn } from "./ui"

export default function GroupsPanel({ onClose }) {
  const [groups,  setGroups]  = useState([])
  const [view,    setView]    = useState("list") // list | create | join | detail
  const [selGroup,setSelGroup]= useState(null)
  const [members, setMembers] = useState([])
  const [newName, setNewName] = useState("")
  const [joinCode,setJoinCode]= useState("")
  const [msg,     setMsg]     = useState("")

  const load = async () => {
    try { setGroups(await api.getGroups()) } catch {}
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    try {
      const g = await api.createGroup(newName)
      setMsg(`Grup "${g.name}" dibuat! Kode: ${g.invite_code}`)
      setNewName("")
      load()
    } catch (e) { setMsg(e.message) }
  }

  const join = async () => {
    if (!joinCode.trim()) return
    try {
      const res = await api.joinGroup(joinCode)
      setMsg(`Berhasil bergabung ke "${res.group}"!`)
      setJoinCode("")
      load()
    } catch (e) { setMsg(e.message) }
  }

  const openDetail = async (group) => {
    setSelGroup(group)
    setView("detail")
    try {
      setMembers(await api.getMembers(group.id))
    } catch {}
  }

  const leave = async (id) => {
    if (!confirm("Keluar dari grup ini?")) return
    try {
      await api.leaveGroup(id)
      setView("list")
      load()
    } catch (e) { setMsg(e.message) }
  }

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0f0f0f] border-l border-white/8 z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          {view !== "list" && (
            <button onClick={() => { setView("list"); setMsg("") }} className="text-gray-500 hover:text-white">
              ←
            </button>
          )}
          <h2 className="font-bold text-white">
            {view === "list"   ? "Grup Lokasi" :
             view === "create" ? "Buat Grup" :
             view === "join"   ? "Gabung Grup" :
             selGroup?.name}
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">

        {msg && (
          <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
            {msg}
            <button onClick={() => setMsg("")} className="float-right text-gray-500">×</button>
          </div>
        )}

        {/* List grup */}
        {view === "list" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => { setView("create"); setMsg("") }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all">
                + Buat Grup
              </button>
              <button onClick={() => { setView("join"); setMsg("") }}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-xs font-medium hover:bg-white/10 transition-all">
                Masukkan Kode
              </button>
            </div>

            {groups.length === 0
              ? <p className="text-gray-500 text-sm text-center py-6">Belum ada grup</p>
              : groups.map(g => (
                <button key={g.id} onClick={() => openDetail(g)}
                  className="w-full flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/6 hover:bg-white/5 transition-all text-left">
                  <div>
                    <p className="text-sm font-medium text-white">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.member_count} anggota · Kode: {g.invite_code}</p>
                  </div>
                  {g.is_owner && <span className="text-xs text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">Owner</span>}
                </button>
              ))
            }
          </div>
        )}

        {/* Buat grup */}
        {view === "create" && (
          <div className="space-y-3">
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && create()}
              placeholder="Nama grup..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60"
            />
            <Btn onClick={create} full>Buat Grup</Btn>
          </div>
        )}

        {/* Join grup */}
        {view === "join" && (
          <div className="space-y-3">
            <p className="text-gray-500 text-xs">Masukkan kode undangan dari temanmu</p>
            <input
              value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && join()}
              placeholder="Kode grup (contoh: AB12CD)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 tracking-widest"
              maxLength={8}
            />
            <Btn onClick={join} full>Gabung</Btn>
          </div>
        )}

        {/* Detail grup */}
        {view === "detail" && selGroup && (
          <div className="space-y-3">
            <div className="p-3 bg-white/3 rounded-xl border border-white/6">
              <p className="text-xs text-gray-500 mb-1">Kode undangan</p>
              <p className="text-lg font-bold text-emerald-400 tracking-widest">{selGroup.invite_code}</p>
              <p className="text-xs text-gray-600 mt-1">Bagikan ke teman agar bisa gabung</p>
            </div>

            <p className="text-xs text-gray-500 font-medium">{members.length} ANGGOTA</p>

            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/6">
                <Avatar username={m.username} color={m.avatar_color} online={m.is_online} />
                <div>
                  <p className="text-sm font-medium text-white">{m.username}</p>
                  <p className={`text-xs ${m.is_online ? "text-emerald-400" : "text-gray-500"}`}>
                    {m.is_online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            ))}

            <Btn variant="danger" full onClick={() => leave(selGroup.id)} className="mt-4">
              Keluar dari Grup
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}
