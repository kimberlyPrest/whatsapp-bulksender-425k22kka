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
  onChange: (config: DistributionConfig) => void
}

export function InstanceSelector({ instances, onChange }: Props) {
  const activeInstances = instances.filter((i) => i.status === 'connected')

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
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    }
  }

  const handlePercentageChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0
    setCustomPercentages({ ...customPercentages, [id]: num })
  }

  return (
    <div className="bg-sidebarBg rounded-xl p-6 border border-slate-700 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Números de Envio</h3>
        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          <button
            id="dist-mode-equal"
            onClick={() => setMode('equal')}
            className={cn(
              'px-3 py-1 rounded-md font-semibold transition-colors text-xs',
              mode === 'equal'
                ? 'bg-primary text-primary-foreground dist-mode-btn active'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Igual
          </button>
          <button
            id="dist-mode-custom"
            onClick={() => setMode('custom')}
            className={cn(
              'px-3 py-1 rounded-md font-semibold transition-colors text-xs',
              mode === 'custom'
                ? 'bg-primary text-primary-foreground dist-mode-btn active'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Personalizado
          </button>
        </div>
      </div>

      <div id="instance-selector-list" className="space-y-3 mt-4">
        {activeInstances.map((inst) => {
          const isSelected = selectedIds.includes(inst.id)
          return (
            <div
              key={inst.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 transition-all hover:bg-slate-800/40"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`inst-${inst.id}`}
                  checked={isSelected}
                  onCheckedChange={(c) => toggleInstance(inst.id, !!c)}
                  className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={`inst-${inst.id}`}
                  className="text-sm font-medium text-slate-200 cursor-pointer flex flex-col"
                >
                  {inst.name}
                  <span className="text-xs text-slate-500">{inst.phone}</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                {mode === 'custom' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      disabled={!isSelected}
                      value={customPercentages[inst.id] ?? ''}
                      onChange={(e) => handlePercentageChange(inst.id, e.target.value)}
                      className="w-20 h-8 text-right bg-slate-900 border-slate-700 text-slate-200"
                    />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 w-24 text-right">
                    {isSelected ? `${(100 / (selectedIds.length || 1)).toFixed(1)}%` : '0%'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p
        id="dist-sum-error"
        className={cn('text-xs text-red-400 font-medium', isError ? 'block' : 'hidden')}
      >
        A soma das porcentagens deve ser 100%.
      </p>
    </div>
  )
}
