import { useState } from 'react'
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
import { Search, Filter, Send } from 'lucide-react'
import useAppStore, { Contact } from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

const MOCK_CLIENTS: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 555 0101',
    product: 'ELITE',
    stage: 'Negotiation',
    days: 12,
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 555 0102',
    product: 'LABS',
    stage: 'Onboarding',
    days: 5,
  },
  {
    id: '3',
    name: 'Acme Corp',
    phone: '+1 555 0103',
    product: 'SCALE',
    stage: 'Discovery',
    days: 30,
  },
  {
    id: '4',
    name: 'Global Tech',
    phone: '+1 555 0104',
    product: 'ELITE',
    stage: 'Closed Won',
    days: 2,
  },
  {
    id: '5',
    name: 'Maria Garcia',
    phone: '+1 555 0105',
    product: 'LABS',
    stage: 'Negotiation',
    days: 15,
  },
  {
    id: '6',
    name: 'Robert Chen',
    phone: '+1 555 0106',
    product: 'SCALE',
    stage: 'Discovery',
    days: 8,
  },
  {
    id: '7',
    name: 'Data Systems',
    phone: '+1 555 0107',
    product: 'ELITE',
    stage: 'Onboarding',
    days: 22,
  },
]

export default function Clients() {
  const { setSelectedContacts } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('ALL')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    const matchesProduct = selectedProduct === 'ALL' || c.product === selectedProduct
    return matchesSearch && matchesProduct
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-1">Filter and select contacts from your CRM.</p>
      </div>

      <Card className="shadow-lg">
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
          <div className="flex gap-4">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[180px] bg-background">
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
            <Input
              type="number"
              placeholder="Min days in stage"
              className="w-[150px] bg-background"
            />
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
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Days in Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer"
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No clients found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card border border-primary/30 p-4 rounded-full shadow-2xl shadow-primary/10 animate-slide-up z-50">
          <span className="font-medium px-2">{selectedIds.size} selected</span>
          <Button onClick={handleAddToDispatch} className="rounded-full px-6 font-bold shadow-md">
            <Send className="w-4 h-4 mr-2" /> Add to Dispatch
          </Button>
        </div>
      )}
    </div>
  )
}
