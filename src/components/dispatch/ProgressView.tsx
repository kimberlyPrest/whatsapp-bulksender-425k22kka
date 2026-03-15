import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'

interface LogEntry {
  id: string
  phone: string
  status: 'success' | 'error'
  time: string
}

interface Props {
  total: number
  sent: number
  logs: LogEntry[]
  isSending: boolean
}

export function ProgressView({ total, sent, logs, isSending }: Props) {
  const percent = total > 0 ? Math.round((sent / total) * 100) : 0
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          Live Progress
          {isSending && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-secondary"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-bold">{percent}%</span>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-3xl font-bold text-primary">{sent}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-3xl font-bold">{total - sent}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No logs yet.</p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30 border border-border animate-fade-in-up"
            >
              <div className="flex items-center gap-2">
                {log.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="font-mono">{log.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{log.time}</span>
                <Badge
                  variant="outline"
                  className={
                    log.status === 'success'
                      ? 'text-primary border-primary/30 bg-primary/10'
                      : 'text-destructive border-destructive/30 bg-destructive/10'
                  }
                >
                  {log.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
