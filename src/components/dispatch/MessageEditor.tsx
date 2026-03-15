import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  message: string
  setMessage: (val: string) => void
}

export function MessageEditor({ message, setMessage }: Props) {
  const insertVariable = (variable: string) => {
    setMessage((prev) => prev + ` {${variable}}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Message Template</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertVariable('first_name')}
            className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            + {'{first_name}'}
          </Button>
        </div>
      </div>
      <Textarea
        placeholder="Hello {first_name}, here is your update..."
        className="min-h-[150px] resize-none focus-visible:ring-primary"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="text-xs text-muted-foreground text-right">{message.length} characters</p>
    </div>
  )
}
