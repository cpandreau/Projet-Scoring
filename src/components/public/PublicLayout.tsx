import { Header } from './Header'
import { Footer } from './Footer'

interface PublicLayoutProps {
  children: React.ReactNode
  headerVariant?: 'transparent' | 'solid'
}

export function PublicLayout({
  children,
  headerVariant = 'transparent',
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={headerVariant} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
