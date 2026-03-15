import { useState } from 'react'
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
import { Search, Filter, Send, MessageCircle, Loader2 } from 'lucide-react'
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
    index: 1,
    name: 'John Doe',
    phone: '+1 555 0101',
    product: 'ELITE',
    stage: 'Negotiation',
    days: 12,
    owner: 'Kimberly',
    status: 'Pronto',
  },
  {
    id: '2',
    index: 2,
    name: 'Jane Smith',
    phone: '+1 555 0102',
    product: 'LABS',
    stage: 'Onboarding',
    days: 5,
    owner: 'Matheus',
    status: 'Pronto',
  },
  {
    id: '3',
    index: 3,
    name: 'Acme Corp',
    phone: '+1 555 0103',
    product: 'SCALE',
    stage: 'Discovery',
    days: 30,
    owner: 'Kimberly',
    status: 'Pronto',
  },
  {
    id: '4',
    index: 4,
    name: 'Global Tech',
    phone: '+1 555 0104',
    product: 'ELITE',
    stage: 'Closed Won',
    days: 2,
    owner: 'Matheus',
    status: 'Pronto',
  },
]

export default function Clients() {
  const { user, setSelectedContacts } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('ALL')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOwner, setSelectedOwner] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [csatModalOpen, setCsatModalOpen] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSendingCsat, setIsSendingCsat] = useState(false)

  if (user?.role === 'Geral') return <Navigate to="/" replace />

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    const matchesProduct = selectedProduct === 'ALL' || c.product === selectedProduct
    const matchesOwner = selectedOwner === 'ALL' || c.owner === selectedOwner
    return matchesSearch && matchesProduct && matchesOwner
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    setSelectedIds(next)
  }

  const handleAddToDispatch = () => {
    const toAdd = MOCK_CLIENTS.filter((c) => selectedIds.has(c.id)).map((c, i) => ({
      ...c,
      index: i + 1,
    }))
    setSelectedContacts(toAdd)
    toast({
      title: 'Contatos Adicionados',
      description: `${toAdd.length} clientes prontos para disparo.`,
    })
    navigate('/')
  }

  const handleSendCsat = () => {
    setIsSendingCsat(true)
    setTimeout(() => {
      setIsSendingCsat(false)
      setCsatModalOpen(false)
      toast({ title: 'CSAT Enviado', description: `Enviado para ${selectedIds.size} cliente(s).` })
      setSelectedIds(new Set())
    }, 1500)
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Clientes CRM</h1>
        <p className="text-muted-foreground mt-1">Selecione clientes do Hubspot para campanhas.</p>
      </div>

      <Card className="shadow-lg border-border/50 bg-card">
        <CardContent className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-secondary/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome ou telefone..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[150px] bg-background">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Produtos</SelectItem>
                <SelectItem value="ELITE">ELITE</SelectItem>
                <SelectItem value="LABS">LABS</SelectItem>
                <SelectItem value="SCALE">SCALE</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead className="text-right">Dias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer data-[state=selected]:bg-primary/10"
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
                  <TableCell>{c.stage}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{c.days} d</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-secondary/90 backdrop-blur-xl border border-border py-3 px-6 rounded-full shadow-2xl animate-slide-up z-50 transition-all">
          <div className="flex items-center gap-2 border-r border-border pr-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="font-medium text-sm">selecionados</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddToDispatch} variant="outline" className="bg-background">
              <Send className="w-4 h-4 mr-2" /> Disparo
            </Button>
            <Button onClick={() => setCsatModalOpen(true)}>
              <MessageCircle className="w-4 h-4 mr-2" /> CSAT
            </Button>
          </div>
        </div>
      )}

      <Dialog open={csatModalOpen} onOpenChange={setCsatModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disparo CSAT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              defaultValue="Olá {primeiro_nome}! Responda nossa pesquisa: {link_csat}"
              rows={4}
            />
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label htmlFor="schedule-csat">Agendar envio</Label>
              <Switch id="schedule-csat" checked={isScheduled} onCheckedChange={setIsScheduled} />
            </div>
            {isScheduled && (
              <div className="flex gap-2">
                <Input type="date" className="flex-1" />
                <Input type="time" className="w-[120px]" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCsatModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendCsat} disabled={isSendingCsat}>
              {isSendingCsat ? <Loader2 className="animate-spin w-4 h-4" /> : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
