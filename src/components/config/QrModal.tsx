import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import useAppStore, { WhatsAppInstance } from '@/stores/useAppStore'

interface Props {
  instance: WhatsAppInstance | null
  onClose: () => void
}

export function QrModal({ instance, onClose }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [maxTime, setMaxTime] = useState(45)
  const [status, setStatus] = useState<'waiting' | 'connected' | 'expired'>('waiting')
  const { setInstances, instances } = useAppStore()

  const timerRef = useRef<NodeJS.Timeout>(undefined)
  const pollRef = useRef<NodeJS.Timeout>(undefined)

  const fetchQr = async () => {
    if (!instance) return
    setLoading(true)
    setStatus('waiting')
    setQrCode(null)
    try {
      const res = await api.getInstanceQr(instance.id)
      setQrCode(res.qr)
      setMaxTime(res.expires_in_seconds || 45)
      setTimeLeft(res.expires_in_seconds || 45)
    } catch (e: any) {
      if (e?.status === 409) {
        handleSuccess()
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (instance && status === 'waiting') {
      fetchQr()
    }
    return () => clearTimers()
  }, [instance])

  useEffect(() => {
    if (status === 'waiting') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setStatus('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [status, qrCode])

  useEffect(() => {
    if (status === 'waiting' && instance) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await api.checkInstanceStatus(instance.id)
          if (res.status === 'connected') {
            handleSuccess()
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [status, instance])

  const handleSuccess = () => {
    setStatus('connected')
    clearTimers()
    if (instance) {
      setInstances(instances.map((i) => (i.id === instance.id ? { ...i, status: 'connected' } : i)))
    }
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const clearTimers = () => {
    clearInterval(timerRef.current)
    clearInterval(pollRef.current)
  }

  return (
    <Dialog open={!!instance} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        id="qr-modal"
        className="backdrop-blur-sm sm:max-w-md bg-background border-border"
      >
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {status === 'connected' ? (
            <div className="flex flex-col items-center text-green-500 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <p className="font-medium">Número conectado com sucesso!</p>
            </div>
          ) : (
            <>
              <div className="w-64 h-64 bg-secondary/30 rounded-lg flex items-center justify-center border border-border overflow-hidden p-2">
                {loading ? (
                  <p className="text-muted-foreground animate-pulse">Carregando...</p>
                ) : qrCode ? (
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className={`w-full h-full object-contain ${status === 'expired' ? 'opacity-20 grayscale' : ''}`}
                  />
                ) : null}
              </div>

              <div className="w-full space-y-4 text-center">
                {status === 'expired' ? (
                  <Button onClick={fetchQr} className="gap-2 w-full max-w-[200px]">
                    <span className="text-lg leading-none mb-1">↺</span> Gerar novo QR
                  </Button>
                ) : (
                  <div className="qr-timer-wrap space-y-2 w-full max-w-[250px] mx-auto">
                    <p className="text-sm font-medium">⏱ Expira em {timeLeft}s</p>
                    <Progress
                      value={maxTime > 0 ? (timeLeft / maxTime) * 100 : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Aguardando scan...</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
