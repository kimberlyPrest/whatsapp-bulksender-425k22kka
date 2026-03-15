import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Play, CalendarClock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageEditor } from '@/components/dispatch/MessageEditor'
import { MessageVariations, VariationsState } from '@/components/dispatch/MessageVariations'
import { AntiBanConfig, AntiBanSettings } from '@/components/dispatch/AntiBanConfig'
import { ProgressView, StreamEvent } from '@/components/dispatch/ProgressView'
import { SourceTabs } from '@/components/dispatch/SourceTabs'
import { ContactTable } from '@/components/dispatch/ContactTable'
import { InstanceSelector, DistributionConfig } from '@/components/dispatch/InstanceSelector'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { useDispatchSimulation } from '@/hooks/useDispatchSimulation'

export default function Index() {
  const { selectedContacts, setSelectedContacts, instances, sourceType, sourceFilename, sheetUrl } =
    useAppStore()
  const { toast } = useToast()
  const { start: simulateStart, stop: simulateStop } = useDispatchSimulation()

  const [message, setMessage] = useState('')
  const [variations, setVariations] = useState<VariationsState>({ status: 'idle', data: [] })
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const [distConfig, setDistConfig] = useState<DistributionConfig>({
    mode: 'equal',
    selection: [],
    isValid: true,
  })

  const [antiBan, setAntiBan] = useState<AntiBanSettings>({
    mainBatch: { interval: 50, minDelay: 60, maxDelay: 120 },
    subBatch: { interval: 10, minDelay: 15, maxDelay: 30 },
    individual: { minDelay: 1, maxDelay: 3 },
  })

  const [isSending, setIsSending] = useState(false)
  const [events, setEvents] = useState<StreamEvent[]>([])

  useEffect(() => {
    return () => simulateStop()
  }, [simulateStop])

  // Reset variations when base template changes
  useEffect(() => {
    setVariations({ status: 'idle', data: [] })
  }, [message])

  const handleEvent = (ev: StreamEvent) => {
    setEvents((prev) => [...prev, ev])
    if (ev.type === 'sent') {
      setSelectedContacts(
        selectedContacts.map((c) =>
          c.id === ev.contactId
            ? {
                ...c,
                status: ev.status,
                error: ev.error,
                time: new Date().toLocaleTimeString('pt-BR'),
              }
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

    const activeInstances = instances.filter((i) => i.status === 'connected' && i.is_active)
    if (activeInstances.length === 0)
      return toast({ title: 'Nenhum número de envio conectado', variant: 'destructive' })

    if (distConfig.mode === 'custom' && !distConfig.isValid) {
      return toast({
        title: 'A distribuição personalizada deve somar 100%',
        variant: 'destructive',
      })
    }

    const payload = {
      instance_ids: distConfig.selection.map((s) => s.instanceId),
      instance_distribution: distConfig.selection,
      source_type: sourceType || 'csv',
      sheet_url: sheetUrl || '',
      contacts_json: selectedContacts,
      source_filename: sourceFilename || '',
      template: message,
      variations:
        variations.status === 'approved' && variations.data.length > 0 ? variations.data : [],
    }

    if (isScheduled) {
      if (!scheduleDate) return toast({ title: 'Selecione a data', variant: 'destructive' })
      await api.scheduleDispatch({ ...payload, antiBan, date: scheduleDate, distConfig })
      toast({ title: 'Disparo Agendado com sucesso!' })
      return
    }

    setIsSending(true)
    setEvents([])
    setSelectedContacts(selectedContacts.map((c) => ({ ...c, status: 'Processando', error: '' })))

    try {
      await api.startDispatch({ ...payload, antiBan, distConfig })
      await api.getStreamToken()
      simulateStart(selectedContacts, antiBan, distConfig, instances, handleEvent)
    } catch {
      simulateStart(selectedContacts, antiBan, distConfig, instances, handleEvent)
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

              {selectedContacts.length > 0 && message.trim() && (
                <MessageVariations
                  template={message}
                  contactsCount={selectedContacts.length}
                  variations={variations}
                  onChange={setVariations}
                />
              )}

              <InstanceSelector
                instances={instances}
                totalContacts={selectedContacts.length}
                onChange={setDistConfig}
              />

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
              logs={selectedContacts}
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
