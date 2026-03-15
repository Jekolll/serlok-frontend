// src/hooks/useSocket.js
import { useEffect, useRef, useCallback, useState } from "react"
import { wsUrl } from "../lib/api"

export function useSocket({ onLocation, onUserOnline, onUserOffline, onBulkLocation }) {
  const wsRef      = useRef(null)
  const [connected, setConnected] = useState(false)
  const reconnectRef = useRef(null)

  const connect = useCallback(() => {
    const url = wsUrl()
    if (!url.includes("null") && !url.includes("undefined")) {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        console.log("[WS] Connected")
        // Mulai kirim lokasi GPS
        startSendingLocation()
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === "location")       onLocation?.(data)
          if (data.type === "user_online")    onUserOnline?.(data.user_id)
          if (data.type === "user_offline")   onUserOffline?.(data.user_id)
          if (data.type === "bulk_location")  onBulkLocation?.(data.locations)
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        console.log("[WS] Disconnected — reconnect in 3s")
        reconnectRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()
    }
  }, [onLocation, onUserOnline, onUserOffline, onBulkLocation])

  const startSendingLocation = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.watchPosition(
      (pos) => {
        const ws = wsRef.current
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type:     "location",
            lat:      pos.coords.latitude,
            lng:      pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }))
        }
      },
      (err) => console.warn("[GPS]", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected }
}
