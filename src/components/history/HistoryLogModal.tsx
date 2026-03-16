import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { downloadCsv } from '@/lib/export'
import { useEffect, useState } from 'react'
import { Contact } from '@/stores/useAppStore'
import { esc } from '@/lib/utils'

interface Props {
  dispatchId: string | null
  campaignName: string
  onClose: () => void
}

export function HistoryLogModal({ dispatchId, campaignName, onClose }: Props) {
  const [logs, setLogs] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dispatchId) return
    setLoading(true)
    setTimeout(() => {
      setLogs(
        Array.from({ length: 15 }).map((_, i) => {
          const isError = i % 5 === 0
          const status = isError ? 'Erro' : 'Enviado'
          const delivery_status = isError
            ? 'failed'
            : i % 2 === 0
              ? 'read'
              : i % 3 === 0
                ? 'delivered'
                : 'sent'

          return {
            id: `${i}`,
            index: i + 1,
            name: `Cliente ${i + 1}`,
            phone: `+55 11 99999-00${i.toString().padStart(2, '0')}`,
            status,
            error: isError ? 'Timeout' : undefined,
            time: new Date().toLocaleTimeString(),
            delivery_status: delivery_status as any,
            delivered_at:
              delivery_status === 'delivered' || delivery_status === 'read'
                ? new Date().toLocaleTimeString()
                : undefined,
            read_at: delivery_status === 'read' ? new Date().toLocaleTimeString() : undefined,
          }
        }),
      )
      setLoading(false)
    }, 500)
  }, [dispatchId])

  const total = logs.length
  const sent = logs.filter((l) => l.status === 'Enviado').length
  const errors = logs.filter((l) => l.status === 'Erro').length
  const delivered = logs.filter(
    (l) => l.delivery_status === 'delivered' || l.delivery_status === 'read',
  ).length
  const read = logs.filter((l) => l.delivery_status === 'read').length

  const getDeliveryStatus = (status?: string) => {
    if (status === 'read') return <span className="text-blue-400 font-medium">✓✓ Lido</span>
    if (status === 'delivered')
      return <span className="text-slate-400 font-medium">✓✓ Entregue</span>
    if (status === 'failed') return <span className="text-red-400 font-medium">✗ Falhou</span>
    return <span className="text-slate-600 font-medium">✓ Enviado</span>
  }

  return (
    <Dialog open={!!dispatchId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl border-primary/20 bg-card p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/30">
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-xl">{esc(campaignName)} — Logs</DialogTitle>
              <DialogDescription className="mt-1 flex flex-col gap-1">
                <span>Relatório detalhado de entrega</span>
                {!loading && logs.length > 0 && (
                  <span className="modal-stats text-xs font-medium text-muted-foreground bg-secondary/50 p-1.5 rounded inline-block w-fit mt-1">
                    {total} registros · {sent} enviados · {errors} erros
                    {delivered > 0 && ` · ${delivered} entregues`}
                    {read > 0 && ` · ${read} lidos`}
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-background shrink-0"
              onClick={() => downloadCsv(`logs_${campaignName}.csv`, logs)}
              disabled={loading || logs.length === 0}
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          <div className="border rounded-md border-border bg-background">
            <Table>
              <TableHeader className="bg-secondary/40 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead className="text-right">Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs">{log.index}</TableCell>
                      <TableCell className="font-medium">{esc(log.name)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {esc(log.phone)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={
                              log.status === 'Enviado'
                                ? 'text-green-500 border-green-500/30 bg-green-500/10'
                                : 'text-red-500 border-red-500/30 bg-red-500/10'
                            }
                          >
                            {esc(log.status)}
                          </Badge>
                          {log.error && (
                            <span className="text-xs text-red-400">{esc(log.error)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getDeliveryStatus(log.delivery_status)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {log.time}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
