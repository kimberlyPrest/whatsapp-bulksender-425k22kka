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
  email?: string
  product?: string
  stage?: string
  days?: number
  owner?: string
  noMeeting?: boolean
}

export type UserRole = 'SuperAdmin' | 'Elite' | 'Geral'

export interface User {
  email: string
  name: string
  role: UserRole
}

export interface WhatsAppInstance {
  id: string
  name: string
  phone: string
  status: 'connected' | 'disconnected'
}

interface AppState {
  user: User | null
  login: (user: User) => void
  logout: () => void
  selectedContacts: Contact[]
  setSelectedContacts: (contacts: Contact[]) => void
  instances: WhatsAppInstance[]
  setInstances: (instances: WhatsAppInstance[]) => void
  sourceType: 'csv' | 'sheets' | ''
  setSourceType: (type: 'csv' | 'sheets' | '') => void
  sourceFilename: string
  setSourceFilename: (name: string) => void
  sheetUrl: string
  setSheetUrl: (url: string) => void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  const [sourceType, setSourceType] = useState<'csv' | 'sheets' | ''>('')
  const [sourceFilename, setSourceFilename] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')

  // Mock instances to enable Instance Selection testing
  const [instances, setInstances] = useState<WhatsAppInstance[]>([
    { id: '1', name: 'Atendimento Principal', phone: '+55 11 99999-1111', status: 'connected' },
    { id: '2', name: 'Suporte Secundário', phone: '+55 11 99999-2222', status: 'connected' },
    { id: '3', name: 'Vendas VIP', phone: '+55 11 99999-3333', status: 'disconnected' },
  ])

  return (
    <AppContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
        selectedContacts,
        setSelectedContacts,
        instances,
        setInstances,
        sourceType,
        setSourceType,
        sourceFilename,
        setSourceFilename,
        sheetUrl,
        setSheetUrl,
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
