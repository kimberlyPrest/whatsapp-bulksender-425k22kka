import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function AntiBanConfig() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-card rounded-lg border border-border px-4 shadow-sm"
    >
      <AccordionItem value="antiban" className="border-none">
        <AccordionTrigger className="hover:no-underline hover:text-primary">
          <span className="font-semibold flex items-center gap-2">Anti-ban Configuration</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Pause every (N msgs)</Label>
              <Input type="number" defaultValue={50} className="h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Pause duration (min-max sec)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={60} className="h-8" />
                <span className="text-muted-foreground">-</span>
                <Input type="number" defaultValue={120} className="h-8" />
              </div>
            </div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-md border border-border">
            <h4 className="text-xs font-semibold mb-3">Sub-batch logic</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Smaller pause (N msgs)</Label>
                <Input type="number" defaultValue={10} className="h-8" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Wait (sec)</Label>
                <Input type="number" defaultValue={15} className="h-8" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="indiv-delay" defaultChecked />
            <label
              htmlFor="indiv-delay"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Random delay between individual messages (1-3s)
            </label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
