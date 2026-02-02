import { Bell, Lock, Palette, Settings, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ParametresPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand/10">
              <Settings className="h-6 w-6 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Paramètres — Bientôt disponible</CardTitle>
              <CardDescription>
                Cette fonctionnalité arrive bientôt.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous pourrez bientôt configurer :
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-brand/10">
                  <User className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium">Profil</p>
                  <p className="text-muted-foreground text-xs">
                    Modifiez vos informations personnelles et de contact
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Lock className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium">Sécurité</p>
                  <p className="text-muted-foreground text-xs">
                    Changez votre mot de passe et activez la double authentification
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Bell className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-muted-foreground text-xs">
                    Choisissez quelles alertes recevoir et comment
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Palette className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium">Apparence</p>
                  <p className="text-muted-foreground text-xs">
                    Personnalisez le thème et l&apos;affichage de l&apos;application
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
