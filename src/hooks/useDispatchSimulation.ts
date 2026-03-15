import { useRef, useCallback } from 'react'
import { AntiBanSettings } from '@/components/dispatch/AntiBanConfig'
import { Contact } from '@/stores/useAppStore'
import { StreamEvent } from '@/components/dispatch/ProgressView'

export function useDispatchSimulation() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const start = useCallback(
    (contacts: Contact[], config: AntiBanSettings, onEvent: (ev: StreamEvent) => void) => {
      stop()
      let currentIndex = 0
      let msgCount = 0

      const processNext = () => {
        if (currentIndex >= contacts.length) {
          onEvent({ type: 'done' })
          return
        }

        const contact = contacts[currentIndex]
        msgCount++

        // Check pauses
        if (msgCount % config.mainBatch.interval === 0) {
          const delay = config.mainBatch.minDelay * 1000
          onEvent({ type: 'pause', message: `⏸ Lote concluído, aguardando ${delay / 1000}s` })
          timerRef.current = setTimeout(processNext, delay)
          return
        }

        if (msgCount % config.subBatch.interval === 0) {
          const delay = config.subBatch.minDelay * 1000
          onEvent({ type: 'pause', message: `⏸ Sublote concluído, aguardando ${delay / 1000}s` })
          timerRef.current = setTimeout(processNext, delay)
          return
        }

        // Simulate Send
        const isError = Math.random() > 0.9 // 10% error rate
        onEvent({
          type: 'sent',
          contactId: contact.id,
          status: isError ? 'Erro' : 'Enviado',
          error: isError ? 'Número inválido' : undefined,
        })

        currentIndex++
        const indDelay = Math.max(1000, config.individual.minDelay * 1000)
        timerRef.current = setTimeout(processNext, indDelay)
      }

      processNext()
    },
    [stop],
  )

  return { start, stop }
}
