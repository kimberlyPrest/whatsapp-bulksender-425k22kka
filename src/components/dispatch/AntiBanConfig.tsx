import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert } from 'lucide-react'

export interface AntiBanSettings {
  mainBatch: { interval: number; minDelay: number; maxDelay: number }
  subBatch: { interval: number; minDelay: number; maxDelay: number }
  individual: { minDelay: number; maxDelay: number }
}

interface Props {
  config: AntiBanSettings
  onChange: (config: AntiBanSettings) => void
}

export function AntiBanConfig({ config, onChange }: Props) {
  const update = (path: 'mainBatch' | 'subBatch' | 'individual', field: string, val: string) => {
    onChange({
      ...config,
      [path]: { ...config[path], [field]: parseInt(val) || 0 },
    })
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary/10 rounded-lg border border-border px-4 shadow-sm"
    >
      <AccordionItem value="antiban" className="border-none">
        <AccordionTrigger className="hover:no-underline hover:text-primary py-3">
          <span className="font-semibold flex items-center gap-2 text-sm">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Configuração Anti-Ban (Delays)
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lote Principal */}
            <div className="space-y-3 bg-background p-3 rounded-md border border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Lote Principal
              </h4>
              <div className="space-y-1">
                <Label className="text-xs">Pausar a cada (N msgs)</Label>
                <Input
                  type="number"
                  value={config.mainBatch.interval}
                  onChange={(e) => update('mainBatch', 'interval', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delay (min - max seg)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.mainBatch.minDelay}
                    onChange={(e) => update('mainBatch', 'minDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={config.mainBatch.maxDelay}
                    onChange={(e) => update('mainBatch', 'maxDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Sublote */}
            <div className="space-y-3 bg-background p-3 rounded-md border border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sublote
              </h4>
              <div className="space-y-1">
                <Label className="text-xs">Pausar a cada (N msgs)</Label>
                <Input
                  type="number"
                  value={config.subBatch.interval}
                  onChange={(e) => update('subBatch', 'interval', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delay (min - max seg)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.subBatch.minDelay}
                    onChange={(e) => update('subBatch', 'minDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={config.subBatch.maxDelay}
                    onChange={(e) => update('subBatch', 'maxDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Individual */}
            <div className="space-y-3 bg-background p-3 rounded-md border border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Individual
              </h4>
              <div className="space-y-1">
                <Label className="text-xs opacity-0 hidden md:block">Spacer</Label>
                <div className="h-8 hidden md:block"></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Delay (min - max seg)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.individual.minDelay}
                    onChange={(e) => update('individual', 'minDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={config.individual.maxDelay}
                    onChange={(e) => update('individual', 'maxDelay', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
