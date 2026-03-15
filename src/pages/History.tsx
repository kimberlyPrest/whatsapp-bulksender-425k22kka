import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Percent, Download } from 'lucide-react'

const MOCK_CAMPAIGNS = [
  {
    id: '1',
    date: '2023-10-25 14:30',
    name: 'Elite Q4 Promo',
    total: 450,
    successRate: 98,
    status: 'Completed',
  },
  {
    id: '2',
    date: '2023-10-20 09:15',
    name: 'Labs Onboarding',
    total: 120,
    successRate: 100,
    status: 'Completed',
  },
  {
    id: '3',
    date: '2023-10-15 16:45',
    name: 'Scale Newsletter',
    total: 890,
    successRate: 92,
    status: 'Completed',
  },
  {
    id: '4',
    date: '2023-10-10 11:00',
    name: 'Re-engagement Batch',
    total: 300,
    successRate: 85,
    status: 'Partial',
  },
]

export default function History() {
  const [selectedCampaign, setSelectedCampaign] = useState<(typeof MOCK_CAMPAIGNS)[0] | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign History</h1>
        <p className="text-muted-foreground mt-1">Audit log of all past dispatches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CAMPAIGNS.map((camp) => (
          <Card
            key={camp.id}
            className="cursor-pointer hover:border-primary/50 transition-colors shadow-md group"
            onClick={() => setSelectedCampaign(camp)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {camp.name}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                    <Calendar className="w-3 h-3" /> {camp.date}
                  </div>
                </div>
                <Badge
                  variant={camp.status === 'Completed' ? 'default' : 'secondary'}
                  className={
                    camp.status === 'Completed'
                      ? 'bg-primary/20 text-primary hover:bg-primary/30'
                      : ''
                  }
                >
                  {camp.status}
                </Badge>
              </div>
              <div className="flex gap-6 border-t border-border pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary rounded-md">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                    <p className="font-semibold">{camp.total}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary rounded-md">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success</p>
                    <p className="font-semibold text-primary">{camp.successRate}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline" className="w-full max-w-xs">
          Load More
        </Button>
      </div>

      <Dialog open={!!selectedCampaign} onOpenChange={(o) => !o && setSelectedCampaign(null)}>
        <DialogContent className="max-w-3xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>{selectedCampaign?.name} Logs</span>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </DialogTitle>
            <DialogDescription>
              Sent on {selectedCampaign?.date} • {selectedCampaign?.total} total contacts
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[50vh] overflow-auto custom-scrollbar border rounded-md border-border">
            <Table>
              <TableHeader className="bg-secondary/50 sticky top-0">
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">
                      +1 555 01{i.toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">14:3{i}:05</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          i !== 3
                            ? 'text-primary border-primary/30 bg-primary/10'
                            : 'text-destructive border-destructive/30 bg-destructive/10'
                        }
                      >
                        {i !== 3 ? 'success' : 'error'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
