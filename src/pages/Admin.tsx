import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Users, Zap, Database, RefreshCw, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore, { UserRole } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const MOCK_USERS_DATA = [
  {
    id: 1,
    name: 'Admin Principal',
    email: 'admin@adapta.org',
    role: 'SuperAdmin' as UserRole,
    lastActive: 'Há 5 mins',
  },
  {
    id: 2,
    name: 'Kimberly',
    email: 'kimberly@adapta.org',
    role: 'Elite' as UserRole,
    lastActive: 'Há 1 hora',
  },
  {
    id: 3,
    name: 'Matheus',
    email: 'matheus@adapta.org',
    role: 'Elite' as UserRole,
    lastActive: 'Há 2 horas',
  },
  {
    id: 4,
    name: 'Leticia User',
    email: 'user@adapta.org',
    role: 'Geral' as UserRole,
    lastActive: 'Ontem',
  },
  {
    id: 5,
    name: 'Copy Dev',
    email: 'dev@copyexperts.com.br',
    role: 'Geral' as UserRole,
    lastActive: 'Há 3 dias',
  },
]

export default function Admin() {
  const { user } = useAppStore()
  const [usersList, setUsersList] = useState(MOCK_USERS_DATA)

  if (user?.role !== 'SuperAdmin') {
    return <Navigate to="/" replace />
  }

  const updateRole = (id: number, newRole: UserRole) => {
    setUsersList(usersList.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
      case 'Elite':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
    }
  }

  const stats = [
    { title: 'Total Messages Sent', value: '1.2M', icon: SendIcon, color: 'text-primary' },
    { title: 'Active Instances', value: '4', icon: Activity, color: 'text-blue-500' },
    { title: 'Registered Users', value: '12', icon: Users, color: 'text-orange-500' },
    { title: 'Database Size', value: '4.2 GB', icon: Database, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-fit text-muted-foreground hover:text-foreground"
        >
          <Link to="/config">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Configuração
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Administração</h1>
            <div
              className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse mt-1"
              title="Live Admin Mode"
            />
          </div>
        </div>
        <p className="text-muted-foreground">
          Gerenciamento de usuários, papéis e controle do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-md border-border/50 bg-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg border-border/60 mt-8">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b border-border pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Usuários e Papéis
            </CardTitle>
            <CardDescription className="mt-1">
              Gerencie quem tem acesso e os níveis de permissão.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="bg-background">
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/10 hover:bg-secondary/10">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="text-right">Último Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(val) => updateRole(u.id, val as UserRole)}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-[140px] h-8 text-xs font-semibold rounded-full border-transparent transition-colors',
                          getRoleColor(u.role),
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                        <SelectItem value="Elite">Elite</SelectItem>
                        <SelectItem value="Geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {u.lastActive}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-md border-destructive/20 mt-8">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Zap className="w-5 h-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h4 className="font-bold text-sm text-destructive">Restart Evolution API</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Force restart all connection instances. This might disrupt ongoing dispatches.
              </p>
            </div>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors shadow-sm">
              Restart Now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SendIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
