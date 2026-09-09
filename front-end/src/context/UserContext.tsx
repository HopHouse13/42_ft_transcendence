import { createContext, useContext, useState, ReactNode } from 'react'

interface CurrentUser {
  id: string
  username: string
  email: string
}

interface UserContextValue {
  user: CurrentUser | null
  setUser: (user: CurrentUser | null) => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

const STORAGE_KEY = 'ft_transcendence_user'

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const setUser = (u: CurrentUser | null) => {
    setUserState(u)
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser doit être utilisé à l'intérieur de <UserProvider>")
  }
  return ctx
}
