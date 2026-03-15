import { createContext, useContext, useState, ReactNode } from 'react'

export interface Contact {
  id: string
  index: number
  name: string
  phone: string
  status: 'Pronto' | 'Enviado' | 'Erro' | 'Processando'
  error?: string
  time?: string
  // Legacy fields for clients page
  product?: string
  stage?: string
  days?: number
  owner?: string
}

export type UserRole = 'SuperAdmin' | 'Elite' | 'Geral'

export interface User {
  email: string
  name: string
  role: UserRole
}

interface AppState {
  user: User | null
  login: (user: User) => void
  logout: () => void
  selectedContacts: Contact[]
  setSelectedContacts: (contacts: Contact[]) => void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  return (
    <AppContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
        selectedContacts,
        setSelectedContacts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
