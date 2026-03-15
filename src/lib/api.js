// src/lib/api.js
const BASE = "https://web-production-1a78.up.railway.app"

const req = async (method, path, body = null) => {
  const token = localStorage.getItem("token")
  const res   = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Request gagal")
  return data
}

export const api = {
  // Auth
  register:     (email, username, password) => req("POST", "/auth/register", { email, username, password }),
  login:        (email, password)           => req("POST", "/auth/login",    { email, password }),
  me:           ()                          => req("GET",  "/auth/me"),
  updateSettings: (body)                    => req("PATCH", "/auth/settings", body),

  // Friends
  getFriends:   ()           => req("GET",  "/friends/"),
  getRequests:  ()           => req("GET",  "/friends/requests"),
  addFriend:    (username)   => req("POST", `/friends/add/${username}`),
  acceptFriend: (id)         => req("POST", `/friends/accept/${id}`),
  removeFriend: (id)         => req("DELETE", `/friends/remove/${id}`),
  searchUsers:  (q)          => req("GET",  `/friends/search/${q}`),

  // Groups
  getGroups:    ()           => req("GET",  "/groups/"),
  createGroup:  (name)       => req("POST", "/groups/", { name }),
  joinGroup:    (code)       => req("POST", `/groups/join/${code}`),
  getMembers:   (id)         => req("GET",  `/groups/${id}/members`),
  leaveGroup:   (id)         => req("DELETE", `/groups/${id}/leave`),

  // Location
  getFriendsLocations: ()         => req("GET", "/location/friends"),
  getHistory:          (userId)   => req("GET", `/location/history/${userId}`),
}

// WebSocket URL
export const wsUrl = () => {
  const token = localStorage.getItem("token")
  return `wss://web-production-1a78.up.railway.app/location/ws/${token}`
}
