import { createContext, useContext, useState, ReactNode } from 'react'

export interface Contact {
  id: string
  name: string
  phone: string
  product: string
  stage: string
  days: number
}

interface AppState {
  user: string | null
  login: (email: string) => void
  logout: () => void
  selectedContacts: Contact[]
  setSelectedContacts: (contacts: Contact[]) => void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null)
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
