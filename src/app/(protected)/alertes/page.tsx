import { Bell, BellRing, Mail, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AlertesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl">Alertes</h1>
        <p className="text-muted-foreground">Restez informé des événements importants</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand/10">
              <Bell className="h-6 w-6 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Alertes — Bientôt disponible</CardTitle>
              <CardDescription>
                Cette fonctionnalité arrive bientôt.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous pourrez bientôt recevoir des alertes pour :
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/50">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Dégradation du score</p>
                  <p className="text-muted-foreground text-xs">
                    Soyez alerté si votre score passe sous un seuil critique
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Échéances importantes</p>
                  <p className="text-muted-foreground text-xs">
                    Rappels pour vos déclarations et obligations légales
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Notifications email</p>
                  <p className="text-muted-foreground text-xs">
                    Recevez un résumé hebdomadaire par email
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
