import { createContext, useContext, useState, ReactNode } from 'react'

export interface Contact {
  id: string
  index: number
  name: string
  phone: string
  status: 'Pronto' | 'Enviado' | 'Erro' | 'Processando'
  error?: string
  time?: string
  delivery_status?: 'sent' | 'delivered' | 'read' | 'failed'
  delivered_at?: string
  read_at?: string
}

export type UserRole = 'SuperAdmin' | 'Elite' | 'Geral'

export interface User {
  email: string
  name: string
  role: UserRole
}

export interface WhatsAppInstance {
  id: string
  display_name: string
  provider?: string
  api_url: string
  api_key?: string
  instance_name: string
  status: 'connected' | 'disconnected' | 'pending_qr'
  is_active: boolean
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

  const [instances, setInstances] = useState<WhatsAppInstance[]>([
    {
      id: '1',
      display_name: 'Atendimento Principal',
      provider: 'Evolution API',
      api_url: 'https://api.bulksender.adapta.org',
      instance_name: 'main-instance',
      status: 'connected',
      is_active: true,
    },
    {
      id: '2',
      display_name: 'Suporte Secundário',
      provider: 'Evolution API',
      api_url: 'https://api.bulksender.adapta.org',
      instance_name: 'support-instance',
      status: 'connected',
      is_active: true,
    },
    {
      id: '3',
      display_name: 'Vendas VIP',
      provider: 'Evolution API',
      api_url: 'https://api.bulksender.adapta.org',
      instance_name: 'vip-sales',
      status: 'pending_qr',
      is_active: false,
    },
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
