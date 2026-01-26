import { redirect } from 'next/navigation'
import { MainContent } from '@/components/layout/main-content'
import { Sidebar } from '@/components/layout/sidebar'
import { PendingEnterpriseProvider } from '@/hooks'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <PendingEnterpriseProvider>
      <div className="min-h-screen bg-background">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Aller au contenu principal
        </a>
        <Sidebar email={user.email || ''} />
        {/* Main content */}
        <main id="main-content" className="lg:pl-64">
          <div className="pt-16 lg:pt-0">
            <div className="container mx-auto px-4 py-6">
              <MainContent>{children}</MainContent>
            </div>
          </div>
        </main>
      </div>
    </PendingEnterpriseProvider>
  )
}
