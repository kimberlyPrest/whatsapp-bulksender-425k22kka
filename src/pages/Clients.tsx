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
import { Search, Send, MessageCircle, Loader2, Phone } from 'lucide-react'
import useAppStore, { Contact } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
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
    email: 'john@doe.com',
    phone: '+1 555 0101',
    product: 'ELITE',
    stage: 'Negotiation',
    days: 32,
    owner: 'Kimberly',
    status: 'Pronto',
    noMeeting: true,
  },
  {
    id: '2',
    index: 2,
    name: 'Jane Smith',
    email: 'jane@smith.com',
    phone: '+1 555 0102',
    product: 'LABS',
    stage: 'Onboarding',
    days: 5,
    owner: 'Matheus',
    status: 'Pronto',
    noMeeting: false,
  },
  {
    id: '3',
    index: 3,
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1 555 0103',
    product: 'SCALE',
    stage: 'Discovery',
    days: 30,
    owner: 'Kimberly',
    status: 'Pronto',
    noMeeting: true,
  },
  {
    id: '4',
    index: 4,
    name: 'Global Tech',
    email: 'hello@global.tech',
    phone: '+1 555 0104',
    product: 'OTHER',
    stage: 'Closed Won',
    days: 2,
    owner: 'Matheus',
    status: 'Pronto',
    noMeeting: false,
  },
]

const getProductColor = (prod: string) => {
  if (prod === 'ELITE') return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
  if (prod === 'LABS') return 'bg-blue-500/20 text-blue-600 border-blue-500/30'
  if (prod === 'SCALE') return 'bg-purple-500/20 text-purple-600 border-purple-500/30'
  return 'bg-slate-500/20 text-slate-600 border-slate-500/30'
}

export default function Clients() {
  const { user, setSelectedContacts } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [product, setProduct] = useState('ALL')
  const [stageFilter, setStageFilter] = useState('')
  const [daysFilter, setDaysFilter] = useState('ALL')
  const [noMeeting, setNoMeeting] = useState(false)
  const [owner, setOwner] = useState('ALL')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [csatModalOpen, setCsatModalOpen] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSendingCsat, setIsSendingCsat] = useState(false)
  const [csatContext, setCsatContext] = useState<Contact[]>([])

  if (user?.role === 'Geral') return <Navigate to="/" replace />

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    const matchesProduct = product === 'ALL' || c.product === product
    const matchesStage = c.stage?.toLowerCase().includes(stageFilter.toLowerCase())
    const matchesNoMeeting = noMeeting ? c.noMeeting : true
    const matchesOwner = owner === 'ALL' || c.owner === owner

    let matchesDays = true
    if (c.days !== undefined) {
      if (daysFilter === '<10') matchesDays = c.days < 10
      if (daysFilter === '10-30') matchesDays = c.days >= 10 && c.days < 30
      if (daysFilter === '>=30') matchesDays = c.days >= 30
    }

    return (
      matchesSearch &&
      matchesProduct &&
      matchesStage &&
      matchesNoMeeting &&
      matchesOwner &&
      matchesDays
    )
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds)
      filtered.forEach((c) => next.add(c.id))
      setSelectedIds(next)
    } else {
      const next = new Set(selectedIds)
      filtered.forEach((c) => next.delete(c.id))
      setSelectedIds(next)
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
    navigate('/')
  }

  const handleOpenCsatMulti = () => {
    setCsatContext(MOCK_CLIENTS.filter((c) => selectedIds.has(c.id)))
    setCsatModalOpen(true)
  }

  const handleOpenCsatSingle = (c: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    setCsatContext([c])
    setCsatModalOpen(true)
  }

  const handleSendCsat = () => {
    setIsSendingCsat(true)
    setTimeout(() => {
      setIsSendingCsat(false)
      setCsatModalOpen(false)
      toast({
        title: isScheduled ? 'CSAT Agendado' : 'CSAT Enviado',
        description: `Enviado para ${csatContext.length} cliente(s).`,
      })
      setSelectedIds(new Set())
    }, 1500)
  }

  const firstContact = csatContext[0]
  const getPreviewUrl = () => {
    if (!firstContact) return ''
    let base = 'https://tally.so/r/default'
    if (firstContact.product === 'ELITE') base = 'https://tally.so/r/wdg6KD'
    else if (firstContact.product === 'LABS') base = 'https://tally.so/r/nre1xl'
    else if (firstContact.product === 'SCALE') base = 'https://form.adapta.org/r/9qqReQ'

    const firstName = firstContact.name.split(' ')[0]
    const number = firstContact.phone.replace(/\D/g, '')
    const email = firstContact.email || ''
    return `${base}?firstname=${encodeURIComponent(firstName)}&consultoria=${number}&e-mail=${encodeURIComponent(email)}`
  }

  const allFilteredSelected = filtered.every((c) => selectedIds.has(c.id)) && filtered.length > 0

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Clientes CRM</h1>
        <p className="text-muted-foreground mt-1">Selecione clientes do Hubspot para campanhas.</p>
      </div>

      <Card className="shadow-lg border-border/50 bg-card">
        <CardContent className="p-4 border-b border-border bg-secondary/20 flex flex-col gap-4">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busca por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Input
              placeholder="Etapas..."
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-[150px] bg-background"
            />
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Produtos</SelectItem>
                <SelectItem value="ELITE">ELITE</SelectItem>
                <SelectItem value="LABS">LABS</SelectItem>
                <SelectItem value="SCALE">SCALE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={daysFilter} onValueChange={setDaysFilter}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Dias na etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os dias</SelectItem>
                <SelectItem value="<10">Menos de 10 dias</SelectItem>
                <SelectItem value="10-30">10 a 30 dias</SelectItem>
                <SelectItem value=">=30">30 dias ou mais</SelectItem>
              </SelectContent>
            </Select>

            {user?.role === 'SuperAdmin' && (
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="w-[150px] bg-background">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Responsáveis</SelectItem>
                  <SelectItem value="Kimberly">Kimberly</SelectItem>
                  <SelectItem value="Matheus">Matheus</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2 bg-background px-3 py-2 rounded-md border border-input h-10">
              <Checkbox
                id="noMeeting"
                checked={noMeeting}
                onCheckedChange={(c) => setNoMeeting(!!c)}
              />
              <label htmlFor="noMeeting" className="text-sm font-medium cursor-pointer">
                Sem reunião marcada
              </label>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox checked={allFilteredSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead className="text-right">Dias</TableHead>
                <TableHead className="w-[80px]"></TableHead>
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
                    <Badge
                      variant="outline"
                      className={cn('bg-background', getProductColor(c.product || ''))}
                    >
                      {c.product}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.stage}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right',
                      c.days && c.days >= 30 ? 'text-red-500 font-bold' : 'text-muted-foreground',
                    )}
                  >
                    {c.days} d
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                      onClick={(e) => handleOpenCsatSingle(c, e)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <div
          id="clients-action-bar"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-secondary/90 backdrop-blur-xl border border-border py-3 px-6 rounded-full shadow-2xl animate-slide-up z-50 transition-all"
        >
          <div className="flex items-center gap-2 border-r border-border pr-4">
            <span className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="font-medium text-sm">
              selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddToDispatch} variant="outline" className="bg-background">
              <Send className="w-4 h-4 mr-2" /> Disparo em massa
            </Button>
            <Button onClick={handleOpenCsatMulti}>
              <MessageCircle className="w-4 h-4 mr-2" /> Pós Call CSAT
            </Button>
          </div>
        </div>
      )}

      <Dialog open={csatModalOpen} onOpenChange={setCsatModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pós Call CSAT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              defaultValue="Olá {primeiro_nome}! Obrigado pela reunião. Por favor, responda nossa pesquisa: {link_csat}"
              rows={4}
            />
            {firstContact && (
              <div className="bg-secondary/30 p-3 rounded-md border border-border text-xs break-all">
                <strong className="block mb-1 text-muted-foreground">
                  Preview URL (1º Contato):
                </strong>
                {getPreviewUrl()}
              </div>
            )}
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
              {isSendingCsat ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : isScheduled ? (
                'Agendar'
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
