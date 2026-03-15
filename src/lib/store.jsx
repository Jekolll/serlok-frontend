// src/lib/store.jsx
import { createContext, useContext, useState } from "react"

const Ctx = createContext(null)

export const StoreProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null") } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem("token") || "")

  const saveAuth = (token, user) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user",  JSON.stringify(user))
    setToken(token); setUser(user)
  }

  const logout = () => {
    localStorage.clear()
    setToken(""); setUser(null)
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    localStorage.setItem("user", JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <Ctx.Provider value={{ user, token, saveAuth, logout, updateUser, isLoggedIn: !!token }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
