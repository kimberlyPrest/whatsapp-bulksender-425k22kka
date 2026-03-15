import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Trash2 } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { AntiBanSettings } from './AntiBanConfig'

interface Props {
  config: AntiBanSettings
}

export function ContactTable({ config }: Props) {
  const { selectedContacts, setSelectedContacts } = useAppStore()

  const estimateTime = () => {
    const c = selectedContacts.length
    if (c === 0) return '0s'
    const ind = (config.individual.minDelay + config.individual.maxDelay) / 2
    const sub = (config.subBatch.minDelay + config.subBatch.maxDelay) / 2
    const main = (config.mainBatch.minDelay + config.mainBatch.maxDelay) / 2

    const subCount = Math.floor(c / (config.subBatch.interval || 1))
    const mainCount = Math.floor(c / (config.mainBatch.interval || 1))

    const totalSecs = Math.round(c * ind + subCount * sub + mainCount * main)
    if (totalSecs < 60) return `${totalSecs}s`
    if (totalSecs < 3600) return `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s`
    return `${Math.floor(totalSecs / 3600)}h ${Math.floor((totalSecs % 3600) / 60)}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pronto':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Pronto</Badge>
      case 'Enviado':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Enviado</Badge>
      case 'Erro':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Erro</Badge>
      case 'Processando':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            Processando
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-[450px]">
      <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Contatos Carregados
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {selectedContacts.length}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> Tempo estimado: {estimateTime()}
          </p>
        </div>
        {selectedContacts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedContacts([])}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-secondary/40 sticky top-0 z-10 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                  Nenhum contato carregado. Use o painel ao lado.
                </TableCell>
              </TableRow>
            ) : (
              selectedContacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-center text-muted-foreground text-xs">
                    {c.index}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {c.phone}
                  </TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
