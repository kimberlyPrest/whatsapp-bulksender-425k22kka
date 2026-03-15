import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Send, MessageCircle, CalendarClock, Loader2 } from 'lucide-react'
import useAppStore, { Contact } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const MOCK_CLIENTS: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 555 0101',
    product: 'ELITE',
    stage: 'Negotiation',
    days: 12,
    owner: 'Kimberly',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 555 0102',
    product: 'LABS',
    stage: 'Onboarding',
    days: 5,
    owner: 'Matheus',
  },
  {
    id: '3',
    name: 'Acme Corp',
    phone: '+1 555 0103',
    product: 'SCALE',
    stage: 'Discovery',
    days: 30,
    owner: 'Kimberly',
  },
  {
    id: '4',
    name: 'Global Tech',
    phone: '+1 555 0104',
    product: 'ELITE',
    stage: 'Closed Won',
    days: 2,
    owner: 'Matheus',
  },
  {
    id: '5',
    name: 'Maria Garcia',
    phone: '+1 555 0105',
    product: 'LABS',
    stage: 'Negotiation',
    days: 15,
    owner: 'Kimberly',
  },
  {
    id: '6',
    name: 'Robert Chen',
    phone: '+1 555 0106',
    product: 'SCALE',
    stage: 'Discovery',
    days: 8,
    owner: 'Leticia',
  },
  {
    id: '7',
    name: 'Data Systems',
    phone: '+1 555 0107',
    product: 'ELITE',
    stage: 'Onboarding',
    days: 22,
    owner: 'Kimberly',
  },
]

export default function Clients() {
  const { user, setSelectedContacts } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('ALL')
  const [selectedOwner, setSelectedOwner] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // CSAT Modal State
  const [csatModalOpen, setCsatModalOpen] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSendingCsat, setIsSendingCsat] = useState(false)

  // Route Protection
  if (user?.role === 'Geral') {
    return <Navigate to="/" replace />
  }

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    const matchesProduct = selectedProduct === 'ALL' || c.product === selectedProduct
    const matchesOwner = selectedOwner === 'ALL' || c.owner === selectedOwner
    return matchesSearch && matchesProduct && matchesOwner
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filtered.map((c) => c.id)))
    else setSelectedIds(new Set())
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) next.add(id)
    else next.delete(id)
    setSelectedIds(next)
  }

  const handleAddToDispatch = () => {
    const toAdd = MOCK_CLIENTS.filter((c) => selectedIds.has(c.id))
    setSelectedContacts(toAdd)
    toast({ title: 'Contacts Added', description: `${toAdd.length} clients ready for dispatch.` })
    navigate('/')
  }

  const handleSendCsat = () => {
    setIsSendingCsat(true)
    setTimeout(() => {
      setIsSendingCsat(false)
      setCsatModalOpen(false)
      toast({
        title: 'Pesquisa CSAT Enviada',
        description: `Enviado para ${selectedIds.size} cliente(s) com sucesso.`,
      })
      setSelectedIds(new Set())
    }, 1500)
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1">Filter and select contacts from your CRM.</p>
      </div>

      <Card className="shadow-lg border-border/50">
        <CardContent className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-secondary/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or phone..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[150px] bg-background">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Products</SelectItem>
                <SelectItem value="ELITE">ELITE</SelectItem>
                <SelectItem value="LABS">LABS</SelectItem>
                <SelectItem value="SCALE">SCALE</SelectItem>
              </SelectContent>
            </Select>

            {user?.role === 'SuperAdmin' && (
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-[150px] bg-background">
                  <UsersIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Owners</SelectItem>
                  <SelectItem value="Kimberly">Kimberly</SelectItem>
                  <SelectItem value="Matheus">Matheus</SelectItem>
                  <SelectItem value="Leticia">Leticia</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Input type="number" placeholder="Min days" className="w-[120px] bg-background" />
          </div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Product</TableHead>
                {user?.role === 'SuperAdmin' && <TableHead>Owner</TableHead>}
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer data-[state=selected]:bg-primary/5"
                  data-state={selectedIds.has(c.id) ? 'selected' : undefined}
                  onClick={() => handleSelectOne(c.id, !selectedIds.has(c.id))}
                >
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={(ch) => handleSelectOne(c.id, !!ch)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">
                      {c.product}
                    </Badge>
                  </TableCell>
                  {user?.role === 'SuperAdmin' && (
                    <TableCell className="text-muted-foreground text-sm">{c.owner}</TableCell>
                  )}
                  <TableCell>{c.stage}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{c.days} d</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No clients found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Floating Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-800 text-slate-50 border border-slate-700 py-3 px-6 rounded-2xl shadow-2xl animate-slide-up z-50 transition-all">
          <div className="flex items-center gap-2 border-r border-slate-600 pr-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="font-medium text-sm">selecionados</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddToDispatch}
              variant="outline"
              className="bg-slate-700/50 hover:bg-slate-700 text-slate-100 border-slate-600 hover:text-white"
            >
              <Send className="w-4 h-4 mr-2" /> Disparo em massa
            </Button>
            <Button
              onClick={() => setCsatModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Pós Call CSAT
            </Button>
          </div>
        </div>
      )}

      {/* CSAT Modal */}
      <Dialog open={csatModalOpen} onOpenChange={setCsatModalOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Disparo Pós Call — CSAT
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template da Mensagem</Label>
              <Textarea
                defaultValue="Olá {primeiro_nome}! Obrigado pela reunião. Por favor, responda nossa pesquisa: {link_csat}"
                rows={4}
                className="bg-secondary/30 font-medium"
              />
              <p className="text-xs text-muted-foreground flex gap-2">
                Variáveis suportadas:
                <code className="bg-secondary px-1 rounded">{'{primeiro_nome}'}</code>
                <code className="bg-secondary px-1 rounded">{'{link_csat}'}</code>
              </p>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <Label
                  htmlFor="schedule-csat"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <CalendarClock className="w-4 h-4 text-primary" />
                  Agendar envio
                </Label>
                <Switch id="schedule-csat" checked={isScheduled} onCheckedChange={setIsScheduled} />
              </div>

              {isScheduled && (
                <div className="flex gap-2 animate-fade-in-down">
                  <Input type="date" className="flex-1 bg-background" />
                  <Input type="time" defaultValue="09:00" className="w-[120px] bg-background" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCsatModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendCsat} disabled={isSendingCsat} className="w-32">
              {isSendingCsat ? <Loader2 className="animate-spin w-4 h-4" /> : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
