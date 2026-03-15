import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Play, CalendarClock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageEditor } from '@/components/dispatch/MessageEditor'
import { AntiBanConfig, AntiBanSettings } from '@/components/dispatch/AntiBanConfig'
import { ProgressView, StreamEvent } from '@/components/dispatch/ProgressView'
import { SourceTabs } from '@/components/dispatch/SourceTabs'
import { ContactTable } from '@/components/dispatch/ContactTable'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { useDispatchSimulation } from '@/hooks/useDispatchSimulation'

export default function Index() {
  const { selectedContacts, setSelectedContacts } = useAppStore()
  const { toast } = useToast()
  const { start: simulateStart, stop: simulateStop } = useDispatchSimulation()

  const [message, setMessage] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const [antiBan, setAntiBan] = useState<AntiBanSettings>({
    mainBatch: { interval: 50, minDelay: 60, maxDelay: 120 },
    subBatch: { interval: 10, minDelay: 15, maxDelay: 30 },
    individual: { minDelay: 1, maxDelay: 3 },
  })

  // Dispatch State
  const [isSending, setIsSending] = useState(false)
  const [events, setEvents] = useState<StreamEvent[]>([])

  useEffect(() => {
    return () => simulateStop()
  }, [simulateStop])

  const handleEvent = (ev: StreamEvent) => {
    setEvents((prev) => [...prev, ev])
    if (ev.type === 'sent') {
      setSelectedContacts(
        selectedContacts.map((c) =>
          c.id === ev.contactId
            ? { ...c, status: ev.status, error: ev.error, time: new Date().toLocaleTimeString() }
            : c,
        ),
      )
    }
    if (ev.type === 'done') setIsSending(false)
  }

  const handleAction = async () => {
    if (selectedContacts.length === 0)
      return toast({ title: 'Adicione contatos', variant: 'destructive' })
    if (!message) return toast({ title: 'Escreva uma mensagem', variant: 'destructive' })

    if (isScheduled) {
      if (!scheduleDate) return toast({ title: 'Selecione a data', variant: 'destructive' })
      await api.scheduleDispatch({ message, antiBan, date: scheduleDate })
      toast({ title: 'Disparo Agendado com sucesso!' })
      return
    }

    setIsSending(true)
    setEvents([])
    // Reset contacts status
    setSelectedContacts(selectedContacts.map((c) => ({ ...c, status: 'Processando', error: '' })))

    try {
      await api.startDispatch({ message, antiBan })
      const { token } = await api.getStreamToken()
      // Simulate EventSource fallback
      simulateStart(selectedContacts, antiBan, handleEvent)
    } catch {
      simulateStart(selectedContacts, antiBan, handleEvent)
    }
  }

  const sentCount = selectedContacts.filter((c) => c.status === 'Enviado').length
  const errCount = selectedContacts.filter((c) => c.status === 'Erro').length

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Novo Disparo</h1>
        <p className="text-muted-foreground mt-1">Configure e inicie sua campanha em massa.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <Card className="shadow-lg border-border/50 bg-card">
            <CardContent className="p-6 space-y-6">
              <SourceTabs />
              <MessageEditor message={message} setMessage={setMessage} />
              <AntiBanConfig config={antiBan} onChange={setAntiBan} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={(c) => setIsScheduled(!!c)}
                  />
                  <label
                    htmlFor="schedule"
                    className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <CalendarClock className="h-4 w-4 text-primary" /> Agendar disparo
                  </label>
                </div>
                {isScheduled && (
                  <Input
                    type="datetime-local"
                    className="w-full sm:w-auto h-9 text-sm bg-background"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6 flex flex-col">
          {isSending || events.length > 0 ? (
            <ProgressView
              total={selectedContacts.length}
              sent={sentCount}
              errorCount={errCount}
              logs={selectedContacts.filter((c) => c.status === 'Enviado' || c.status === 'Erro')}
              events={events}
              isSending={isSending}
            />
          ) : (
            <Card className="shadow-lg border-border/50">
              <CardContent className="p-0">
                <ContactTable config={antiBan} />
              </CardContent>
            </Card>
          )}

          <div className="mt-auto">
            <Button
              size="lg"
              className="w-full font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 h-14"
              onClick={handleAction}
              disabled={isSending || selectedContacts.length === 0}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              {isSending ? 'Enviando...' : isScheduled ? 'Agendar Campanha' : 'Iniciar Disparo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
