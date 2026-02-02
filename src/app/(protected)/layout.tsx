import { redirect } from 'next/navigation'
import { MainContent } from '@/components/layout/main-content'
import { Sidebar } from '@/components/layout/sidebar'
import { PendingEnterpriseProvider } from '@/hooks'
import { getUserWithProfile } from '@/lib/auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const result = await getUserWithProfile()

  if (!result) {
    redirect('/connexion')
  }

  const { user, profile } = result

  return (
    <PendingEnterpriseProvider>
      <div className="min-h-screen bg-background">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-brand/50 focus:shadow-brand"
        >
          Aller au contenu principal
        </a>
        <Sidebar email={user.email} userType={profile.userType} />
        {/* Main content */}
        <main id="main-content" className="lg:pl-64">
          <div className="pt-16 lg:pt-0">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              <MainContent>{children}</MainContent>
            </div>
          </div>
        </main>
      </div>
    </PendingEnterpriseProvider>
  )
}
