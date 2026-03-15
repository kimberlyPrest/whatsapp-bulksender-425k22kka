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
import { api } from '@/lib/api'
import { Contact } from '@/stores/useAppStore'

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
    // Mocking /api/dispatches/${id}/logs
    setTimeout(() => {
      setLogs(
        Array.from({ length: 15 }).map((_, i) => ({
          id: `${i}`,
          index: i + 1,
          name: `Cliente ${i + 1}`,
          phone: `+55 11 99999-00${i.toString().padStart(2, '0')}`,
          status: i % 5 === 0 ? 'Erro' : 'Enviado',
          error: i % 5 === 0 ? 'Timeout' : undefined,
          time: new Date().toLocaleTimeString(),
        })),
      )
      setLoading(false)
    }, 500)
  }, [dispatchId])

  return (
    <Dialog open={!!dispatchId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl border-primary/20 bg-card p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/30">
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-xl">{campaignName} — Logs</DialogTitle>
              <DialogDescription className="mt-1">Relatório detalhado de entrega</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-background"
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
                  <TableHead>Erro</TableHead>
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
                      <TableCell className="font-medium">{log.name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === 'Enviado'
                              ? 'text-green-500 border-green-500/30 bg-green-500/10'
                              : 'text-red-500 border-red-500/30 bg-red-500/10'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-red-400">{log.error || '-'}</TableCell>
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
