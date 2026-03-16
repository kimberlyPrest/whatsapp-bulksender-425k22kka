import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, RotateCcw, ArrowRight } from 'lucide-react'
import { HistoryLogModal } from '@/components/history/HistoryLogModal'
import { mockableApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { esc } from '@/lib/utils'
import { QrModal } from '@/components/config/QrModal'

interface Campaign {
  id: string
  date: string
  name: string
  total: number
  sent: number
  error: number
  status: 'running' | 'completed' | 'error' | 'interrupted'
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    date: '2023-10-25 14:30',
    name: 'Promoção Q4',
    total: 450,
    sent: 441,
    error: 9,
    status: 'completed',
  },
  {
    id: '2',
    date: '2023-10-20 09:15',
    name: 'Onboarding VIP',
    total: 120,
    sent: 120,
    error: 0,
    status: 'completed',
  },
  {
    id: '3',
    date: '2023-10-15 16:45',
    name: 'Newsletter',
    total: 890,
    sent: 400,
    error: 50,
    status: 'interrupted',
  },
  {
    id: '4',
    date: '2023-10-10 11:00',
    name: 'Aviso Sistema',
    total: 300,
    sent: 20,
    error: 280,
    status: 'error',
  },
  {
    id: '5',
    date: '2023-10-09 10:00',
    name: 'Campanha Atual',
    total: 500,
    sent: 250,
    error: 5,
    status: 'running',
  },
]

export default function History() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState('')

  useEffect(() => {
    mockableApiFetch()
  }, [])

  const mockableApiFetch = async () => {
    const res = await mockableApi('/api/dispatches', { method: 'GET' }, () => MOCK_CAMPAIGNS)
    setCampaigns(res)
  }

  const handleResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await mockableApi(`/api/dispatch/${id}/resume`, { method: 'POST' }, () => ({
      success: true,
    }))
    toast({ title: 'Disparo retomado', description: 'A campanha foi reiniciada.' })
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: 'running' } : c)))
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const styles = {
      running: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-500 border-green-500/30',
      error: 'bg-red-500/20 text-red-500 border-red-500/30',
      interrupted: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    }
    const labels = {
      running: 'Em andamento',
      completed: 'Concluído',
      error: 'Erro',
      interrupted: 'Interrompido',
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Campanhas</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe e exporte os resultados dos seus disparos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const successRate = camp.total > 0 ? Math.round((camp.sent / camp.total) * 100) : 0
          return (
            <Card
              key={camp.id}
              className="cursor-pointer border-border/50 hover:border-primary/50 transition-all shadow-md group bg-card hover:bg-secondary/10"
              onClick={() => {
                setSelectedId(camp.id)
                setSelectedName(camp.name)
              }}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      {esc(camp.name)}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                      <Calendar className="w-3 h-3" /> {esc(camp.date)}
                    </div>
                  </div>
                  {getStatusBadge(camp.status)}
                </div>
                <div className="grid grid-cols-4 gap-4 border-t border-border pt-4 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contatos</p>
                    <p className="font-semibold text-sm">{camp.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Enviados</p>
                    <p className="font-semibold text-sm text-green-500">{camp.sent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Erros</p>
                    <p className="font-semibold text-sm text-red-500">{camp.error}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sucesso</p>
                    <p className="font-semibold text-sm text-primary">{successRate}%</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                  {camp.status === 'interrupted' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      onClick={(e) => handleResume(camp.id, e)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retomar
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10 ml-auto"
                  >
                    Ver logs <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <HistoryLogModal
        dispatchId={selectedId}
        campaignName={selectedName}
        onClose={() => setSelectedId(null)}
      />

      <QrModal instance={null} onClose={() => {}} />
    </div>
  )
}
