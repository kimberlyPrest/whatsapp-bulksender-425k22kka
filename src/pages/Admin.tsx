import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Zap, Database } from 'lucide-react'

export default function Admin() {
  const stats = [
    { title: 'Total Messages Sent', value: '1.2M', icon: SendIcon, color: 'text-primary' },
    { title: 'Active Instances', value: '4', icon: Activity, color: 'text-blue-500' },
    { title: 'Registered Users', value: '12', icon: Users, color: 'text-orange-500' },
    { title: 'Database Size', value: '4.2 GB', icon: Database, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System-level metrics and controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-md border-destructive/20 mt-8">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Zap className="w-5 h-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-border rounded-lg bg-secondary/20">
            <div>
              <h4 className="font-bold text-sm">Restart Evolution API</h4>
              <p className="text-xs text-muted-foreground">
                Force restart all connection instances.
              </p>
            </div>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-bold hover:bg-destructive/90 transition-colors">
              Restart Now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SendIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
