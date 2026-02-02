'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  // Focus trap and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      // Focus the close button when menu opens
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden',
          prefersReducedMotion ? '' : 'transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background shadow-2xl lg:hidden',
          prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <Image
                src="/bilantia_logo.svg"
                alt="BILANTIA"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
              <span className="font-display text-lg font-semibold text-foreground">
                BILANTIA
              </span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" aria-label="Menu mobile">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg',
                      'text-base font-medium text-foreground',
                      'hover:bg-muted transition-colors'
                    )}
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="p-4 border-t border-border space-y-3">
            <Link
              href="/connexion"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center w-full px-5 py-3 rounded-lg',
                'text-sm font-medium text-foreground',
                'border border-border hover:bg-muted transition-colors'
              )}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg',
                'text-sm font-semibold text-white',
                'bg-brand hover:bg-brand-dark transition-colors',
                'shadow-brand'
              )}
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Footer info */}
          <div className="p-4 text-center text-xs text-muted-foreground border-t border-border">
            <p>L&apos;équilibre financier révélé</p>
          </div>
        </div>
      </div>
    </>
  )
}
