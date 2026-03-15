// src/App.jsx
import { StoreProvider, useStore } from "./lib/store"
import Auth from "./pages/Auth"
import Map  from "./pages/Map"

const Router = () => {
  const { isLoggedIn } = useStore()
  return isLoggedIn ? <Map /> : <Auth />
}

export default function App() {
  return <StoreProvider><Router /></StoreProvider>
}
