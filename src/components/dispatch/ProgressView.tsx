import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, CheckCircle2, XCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCsv } from '@/lib/export'
import { Contact } from '@/stores/useAppStore'

export type StreamEvent =
  | { type: 'sent'; contactId: string; status: 'Enviado' | 'Erro'; error?: string }
  | { type: 'pause'; message: string }
  | { type: 'done' }

interface Props {
  total: number
  sent: number
  errorCount: number
  logs: Contact[]
  events: StreamEvent[]
  isSending: boolean
}

export function ProgressView({ total, sent, errorCount, logs, events, isSending }: Props) {
  const percent = total > 0 ? Math.round(((sent + errorCount) / total) * 100) : 0
  const radius = 80
  const circumference = 502.65 // 2 * PI * 80
  const strokeDashoffset = circumference - (percent / 100) * circumference

  const isDone = percent === 100 || events.some((e) => e.type === 'done')

  return (
    <Card className="shadow-lg border-primary/30 bg-secondary/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <CardHeader className="pb-2 flex flex-row items-center justify-between mt-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Monitoramento em Tempo Real
          {isSending && !isDone && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!isDone}
          onClick={() => downloadCsv(`dispatch_log_${Date.now()}.csv`, logs)}
          className="h-8 gap-2 bg-background"
        >
          <Download className="w-4 h-4" /> Baixar Log CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8 mb-6 p-4">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-secondary"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-all duration-700 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-3xl font-bold text-foreground">{percent}%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-background p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground font-medium">Enviados</p>
              <p className="text-3xl font-bold text-primary">{sent}</p>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground font-medium">Restantes</p>
              <p className="text-3xl font-bold text-foreground">{total - sent - errorCount}</p>
            </div>
            <div className="bg-background p-4 rounded-lg border border-red-500/20 col-span-2">
              <p className="text-sm text-red-500/80 font-medium">Erros</p>
              <p className="text-2xl font-bold text-red-500">{errorCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border border-border/50 rounded-lg bg-background p-2">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aguardando início do disparo...
            </p>
          )}
          {[...events].reverse().map((ev, i) => {
            if (ev.type === 'pause') {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm p-3 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 animate-fade-in-down"
                >
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{ev.message}</span>
                </div>
              )
            }
            if (ev.type === 'sent') {
              const log = logs.find((l) => l.id === ev.contactId)
              if (!log) return null
              const isErr = ev.status === 'Erro'
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between text-sm p-2 rounded border animate-fade-in-down ${
                    isErr ? 'bg-red-500/5 border-red-500/20' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isErr ? (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="font-medium min-w-[120px] truncate">{log.name}</span>
                    <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                      {log.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isErr && (
                      <span className="text-xs text-red-500 max-w-[150px] truncate">
                        {ev.error}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      </CardContent>
    </Card>
  )
}
