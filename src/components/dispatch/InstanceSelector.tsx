import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { WhatsAppInstance } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export interface DistributionConfig {
  mode: 'equal' | 'custom'
  selection: { instanceId: string; percentage: number }[]
  isValid: boolean
}

interface Props {
  instances: WhatsAppInstance[]
  totalContacts: number
  onChange: (config: DistributionConfig) => void
}

export function InstanceSelector({ instances, totalContacts, onChange }: Props) {
  const activeInstances = instances.filter((i) => i.status === 'connected' && i.is_active)

  const [mode, setMode] = useState<'equal' | 'custom'>('equal')
  const [selectedIds, setSelectedIds] = useState<string[]>(activeInstances.map((i) => i.id))
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({})

  useEffect(() => {
    if (Object.keys(customPercentages).length === 0 && activeInstances.length > 0) {
      const initial: Record<string, number> = {}
      const p = 100 / activeInstances.length
      activeInstances.forEach((i) => (initial[i.id] = p))
      setCustomPercentages(initial)
    }
  }, [activeInstances])

  useEffect(() => {
    let isValid = true
    let selection: { instanceId: string; percentage: number }[] = []

    if (mode === 'equal') {
      const p = selectedIds.length > 0 ? 100 / selectedIds.length : 0
      selection = selectedIds.map((id) => ({ instanceId: id, percentage: p }))
    } else {
      const sum = selectedIds.reduce((acc, id) => acc + (customPercentages[id] || 0), 0)
      if (Math.round(sum) !== 100 && selectedIds.length > 0) isValid = false
      selection = selectedIds.map((id) => ({
        instanceId: id,
        percentage: customPercentages[id] || 0,
      }))
    }

    onChange({ mode, selection, isValid })
  }, [mode, selectedIds, customPercentages, onChange])

  if (activeInstances.length < 2) return null

  const sum = selectedIds.reduce((acc, id) => acc + (customPercentages[id] || 0), 0)
  const isError = mode === 'custom' && Math.round(sum) !== 100

  const toggleInstance = (id: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, id])
    else setSelectedIds(selectedIds.filter((x) => x !== id))
  }

  const handlePercentageChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0
    setCustomPercentages({ ...customPercentages, [id]: Math.min(100, Math.max(0, num)) })
  }

  const getAllocatedCount = (instId: string, isSelected: boolean) => {
    if (!isSelected || totalContacts === 0) return 0
    const pct = mode === 'equal' ? 100 / (selectedIds.length || 1) : customPercentages[instId] || 0
    return Math.floor((totalContacts * pct) / 100)
  }

  return (
    <div
      id="instance-selector-section"
      className="bg-secondary/10 rounded-xl p-5 border border-border shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Números de Envio</h3>
        <div className="flex items-center gap-1 bg-background p-1 rounded-md border border-border">
          <button
            onClick={() => setMode('equal')}
            className={cn(
              'px-3 py-1 rounded text-xs font-semibold transition-colors',
              mode === 'equal'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            Igual
          </button>
          <button
            onClick={() => setMode('custom')}
            className={cn(
              'px-3 py-1 rounded text-xs font-semibold transition-colors',
              mode === 'custom'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            Personalizado
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {activeInstances.map((inst) => {
          const isSelected = selectedIds.includes(inst.id)
          const allocated = getAllocatedCount(inst.id, isSelected)

          return (
            <div
              key={inst.id}
              className="flex items-center justify-between p-3 rounded-md border border-border bg-background transition-all hover:bg-secondary/30"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  value={inst.id}
                  className="inst-selector-check hidden"
                  checked={isSelected}
                  readOnly
                />
                <Checkbox
                  id={`inst-${inst.id}`}
                  checked={isSelected}
                  onCheckedChange={(c) => toggleInstance(inst.id, !!c)}
                />
                <label
                  htmlFor={`inst-${inst.id}`}
                  className="text-sm font-medium cursor-pointer flex flex-col"
                >
                  {inst.display_name}
                  <span className="text-xs text-muted-foreground font-mono">
                    {inst.instance_name}
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-20 text-right">
                  ~{allocated} contatos
                </span>
                {mode === 'custom' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      disabled={!isSelected}
                      value={customPercentages[inst.id] ?? ''}
                      onChange={(e) => handlePercentageChange(inst.id, e.target.value)}
                      className="w-16 h-8 text-right bg-secondary/30"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                ) : (
                  <span className="text-sm font-medium w-16 text-right">
                    {isSelected ? `${(100 / (selectedIds.length || 1)).toFixed(0)}%` : '0%'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p
        id="dist-sum-error"
        className={cn('text-xs text-red-500 font-medium mt-2', isError ? 'block' : 'hidden')}
      >
        A soma das porcentagens deve ser 100%. (Atual: {Math.round(sum)}%)
      </p>
    </div>
  )
}
