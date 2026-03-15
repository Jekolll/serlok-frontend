// src/pages/Map.jsx
import { useState, useEffect, useRef, useCallback } from "react"
import { api } from "../lib/api"
import { useStore } from "../lib/store"
import { useSocket } from "../hooks/useSocket"
import { Avatar, Badge, Btn } from "../components/ui"
import FriendsPanel from "../components/FriendsPanel"
import GroupsPanel  from "../components/GroupsPanel"

export default function Map() {
  const { user, logout }              = useStore()
  const [friends,    setFriends]      = useState([])
  const [locations,  setLocations]    = useState({}) // { user_id: { lat, lng, ... } }
  const [selected,   setSelected]     = useState(null)
  const [panel,      setPanel]        = useState(null) // "friends" | "groups" | null
  const [requests,   setRequests]     = useState([])
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef({}) // { user_id: leaflet marker }

  // ── Load data ──────────────────────────────────────────────
  const loadFriends = useCallback(async () => {
    try {
      const [f, r] = await Promise.all([api.getFriends(), api.getRequests()])
      setFriends(f); setRequests(r)
    } catch {}
  }, [])

  useEffect(() => { loadFriends() }, [loadFriends])

  // ── Init Leaflet map ───────────────────────────────────────
  useEffect(() => {
    if (leafletRef.current) return

    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current, {
      center: [-6.2088, 106.8456], // Jakarta default
      zoom:   13,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    leafletRef.current = map

    // Coba dapat lokasi user sendiri
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15)
      })
    }
  }, [])

  // ── Update marker di map ───────────────────────────────────
  const updateMarker = useCallback((userId, lat, lng, username, color, isMe = false) => {
    const L = window.L
    const map = leafletRef.current
    if (!L || !map) return

    const icon = L.divIcon({
      html: `
        <div style="
          background:${color};
          width:${isMe ? 44 : 36}px;
          height:${isMe ? 44 : 36}px;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:${isMe ? 16 : 13}px;
          color:black;
          font-family:sans-serif;
        ">${username?.[0]?.toUpperCase() || "?"}</div>
        <div style="
          text-align:center;
          font-size:11px;
          font-weight:600;
          color:white;
          text-shadow:0 1px 3px rgba(0,0,0,0.8);
          margin-top:2px;
          white-space:nowrap;
        ">${isMe ? "Kamu" : username}</div>
      `,
      className: "",
      iconSize:  [isMe ? 44 : 36, 60],
      iconAnchor:[isMe ? 22 : 18, 40],
    })

  if (markersRef.current[userId]) {
  markersRef.current[userId].setLatLng([lat, lng])
  return
} else {
      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on("click", () => setSelected(userId))
      markersRef.current[userId] = marker
    }
  }, [])

  // ── WebSocket callbacks ────────────────────────────────────
  const handleLocation = useCallback((data) => {
    setLocations(prev => ({ ...prev, [data.user_id]: data }))
    const friend = friends.find(f => f.id === data.user_id)
    if (friend && friend.share_location) {
      updateMarker(data.user_id, data.lat, data.lng, friend.username, friend.avatar_color)
    }
  }, [friends, updateMarker])

  const handleBulkLocation = useCallback((locs) => {
    const map = {}
    locs.forEach(l => { map[l.user_id] = l })
    setLocations(prev => ({ ...prev, ...map }))
    locs.forEach(l => {
      const friend = friends.find(f => f.id === l.user_id)
      if (friend && friend.share_location) {
        updateMarker(l.user_id, l.lat, l.lng, friend.username, friend.avatar_color)
      }
    })
  }, [friends, updateMarker])

  const handleUserOnline = useCallback((userId) => {
    setFriends(prev => prev.map(f => f.id === userId ? { ...f, is_online: true } : f))
  }, [])

  const handleUserOffline = useCallback((userId) => {
    setFriends(prev => prev.map(f => f.id === userId ? { ...f, is_online: false } : f))
    // Hapus marker
    const map = leafletRef.current
    if (markersRef.current[userId] && map) {
      map.removeLayer(markersRef.current[userId])
      delete markersRef.current[userId]
    }
    setLocations(prev => { const n = {...prev}; delete n[userId]; return n })
  }, [])

  const { connected } = useSocket({
    onLocation:     handleLocation,
    onBulkLocation: handleBulkLocation,
    onUserOnline:   handleUserOnline,
    onUserOffline:  handleUserOffline,
  })

  // Update marker posisi sendiri saat lokasi berubah
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(pos => {
      updateMarker("me", pos.coords.latitude, pos.coords.longitude, user?.username, user?.avatar_color || "#10b981", true)
    })
    return () => navigator.geolocation.clearWatch(id)
  }, [user, updateMarker])

  // Fly to selected user
  const flyTo = (userId) => {
    const loc = userId === "me" ? null : locations[userId]
    if (loc && leafletRef.current) {
      leafletRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1 })
    }
    setSelected(userId)
    setPanel(null)
  }

  const onlineFriends = friends.filter(f => f.is_online)
  const selectedFriend = selected && selected !== "me" ? friends.find(f => f.id === selected) : null

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#111]/90 backdrop-blur border border-white/10 rounded-2xl px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
          <span className="text-white font-bold text-sm">Serlok</span>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
        </div>

        <div className="flex items-center gap-2">
          {requests.length > 0 && (
            <button onClick={() => setPanel("friends")}
              className="relative bg-[#111]/90 backdrop-blur border border-white/10 rounded-xl p-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {requests.length}
              </span>
            </button>
          )}
          <button onClick={() => setPanel(panel === "friends" ? null : "friends")}
            className="bg-[#111]/90 backdrop-blur border border-white/10 rounded-xl p-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </button>
          <button onClick={() => setPanel(panel === "groups" ? null : "groups")}
            className="bg-[#111]/90 backdrop-blur border border-white/10 rounded-xl p-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button onClick={logout}
            className="bg-[#111]/90 backdrop-blur border border-white/10 rounded-xl p-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Online friends bar (bottom) */}
      {onlineFriends.length > 0 && (
        <div className="absolute bottom-6 left-0 right-0 z-10 px-4">
          <div className="bg-[#111]/90 backdrop-blur border border-white/10 rounded-2xl p-3">
            <p className="text-xs text-gray-500 mb-2">Online sekarang ({onlineFriends.length})</p>
            <div className="flex gap-2 overflow-x-auto">
              {onlineFriends.map(f => (
                <button key={f.id} onClick={() => flyTo(f.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-shrink-0 ${selected === f.id ? "bg-emerald-500/15 border border-emerald-500/30" : "hover:bg-white/5"}`}>
                  <Avatar username={f.username} color={f.avatar_color} online={true} />
                  <span className="text-xs text-gray-300 max-w-[60px] truncate">{f.username}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected friend info */}
      {selectedFriend && locations[selectedFriend.id] && (
        <div className="absolute bottom-32 left-4 right-4 z-10">
          <div className="bg-[#111]/95 backdrop-blur border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar username={selectedFriend.username} color={selectedFriend.avatar_color} online={selectedFriend.is_online} size="lg" />
              <div>
                <p className="font-semibold text-white">{selectedFriend.username}</p>
                <p className="text-xs text-gray-500">
                  {new Date(locations[selectedFriend.id].updated_at).toLocaleTimeString("id-ID")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" sm onClick={() => flyTo(selectedFriend.id)}>📍 Fokus</Btn>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>
          </div>
        </div>
      )}

      {/* Side panels */}
      {panel === "friends" && (
        <FriendsPanel
          friends={friends}
          requests={requests}
          onClose={() => setPanel(null)}
          onFlyTo={flyTo}
          onReload={loadFriends}
        />
      )}
      {panel === "groups" && (
        <GroupsPanel onClose={() => setPanel(null)} />
      )}
    </div>
  )
}
