import { useRef, useCallback } from 'react'
import { AntiBanSettings } from '@/components/dispatch/AntiBanConfig'
import { Contact, WhatsAppInstance } from '@/stores/useAppStore'
import { StreamEvent } from '@/components/dispatch/ProgressView'
import { DistributionConfig } from '@/components/dispatch/InstanceSelector'

export function useDispatchSimulation() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const start = useCallback(
    (
      contacts: Contact[],
      config: AntiBanSettings,
      distConfig: DistributionConfig,
      instances: WhatsAppInstance[],
      onEvent: (ev: StreamEvent) => void,
    ) => {
      stop()
      let currentIndex = 0
      let msgCount = 0

      // Map contacts to instances
      const activeInstances = instances.filter((i) =>
        distConfig.selection.find((s) => s.instanceId === i.id),
      )
      const instanceStats: Record<string, { ok: number; fail: number }> = {}

      activeInstances.forEach((i) => (instanceStats[i.display_name] = { ok: 0, fail: 0 }))

      const getInstanceNameForContact = (idx: number) => {
        if (activeInstances.length === 0) return undefined
        if (activeInstances.length === 1) return activeInstances[0].display_name

        let cumulative = 0
        const randomVal = idx % 100
        for (const selection of distConfig.selection) {
          cumulative += selection.percentage
          if (randomVal < cumulative) {
            return instances.find((i) => i.id === selection.instanceId)?.display_name
          }
        }
        return activeInstances[0].display_name
      }

      const processNext = () => {
        if (currentIndex >= contacts.length) {
          // Emit instance done events
          activeInstances.forEach((inst) => {
            onEvent({
              type: 'instance_done',
              instance_name: inst.display_name,
              ok: instanceStats[inst.display_name].ok,
              fail: instanceStats[inst.display_name].fail,
            })
          })
          setTimeout(() => onEvent({ type: 'done' }), 500)
          return
        }

        const contact = contacts[currentIndex]
        const assignedInstance = getInstanceNameForContact(currentIndex)
        msgCount++

        if (msgCount % config.mainBatch.interval === 0) {
          const delay = config.mainBatch.minDelay * 1000
          onEvent({
            type: 'pause',
            message: `⏸ Lote concluído, aguardando ${delay / 1000}s`,
            instance_name: assignedInstance,
          })
          timerRef.current = setTimeout(processNext, delay)
          return
        }

        if (msgCount % config.subBatch.interval === 0) {
          const delay = config.subBatch.minDelay * 1000
          onEvent({
            type: 'pause',
            message: `⏸ Sublote concluído, aguardando ${delay / 1000}s`,
            instance_name: assignedInstance,
          })
          timerRef.current = setTimeout(processNext, delay)
          return
        }

        const isError = Math.random() > 0.9
        if (assignedInstance) {
          if (isError) instanceStats[assignedInstance].fail++
          else instanceStats[assignedInstance].ok++
        }

        onEvent({
          type: 'sent',
          contactId: contact.id,
          status: isError ? 'Erro' : 'Enviado',
          error: isError ? 'Número inválido' : undefined,
          instance_name: assignedInstance,
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
