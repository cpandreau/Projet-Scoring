'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'
import { DarkModeToggle } from './DarkModeToggle'

const navItems = [
  { label: 'Produit', href: '/produit' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Dirigeants', href: '/dirigeants' },
  { label: 'Experts-Comptables', href: '/experts-comptables' },
]

interface HeaderProps {
  variant?: 'transparent' | 'solid'
}

export function Header({ variant = 'transparent' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Determine if we should show light text (transparent header on dark background)
  const isTransparentMode = variant === 'transparent' && !isScrolled
  const showLightText = isTransparentMode

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || variant === 'solid'
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
        )}
      >
        <nav
          aria-label="Navigation principale"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex h-16 items-center justify-between lg:h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Image
                src="/bilantia_logo.svg"
                alt="BILANTIA"
                width={140}
                height={40}
                className={cn(
                  'h-9 w-auto transition-all duration-300',
                  showLightText && 'brightness-0 invert'
                )}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
                    'group',
                    showLightText
                      ? 'text-white/80 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  {/* Animated underline */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-4 right-4 h-0.5 rounded-full',
                      'transform scale-x-0 transition-transform duration-200',
                      'group-hover:scale-x-100',
                      showLightText ? 'bg-white' : 'bg-brand'
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <DarkModeToggle variant="inline" />
              <Link
                href="/connexion"
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  showLightText
                    ? 'text-white/80 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className={cn(
                  'rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                  'bg-brand text-white hover:bg-brand-dark',
                  'shadow-brand hover:shadow-brand-lg',
                  'hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                Commencer
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                'lg:hidden p-2 -mr-2 rounded-lg transition-colors',
                showLightText
                  ? 'text-white hover:bg-white/10'
                  : 'text-foreground hover:bg-muted'
              )}
              aria-label="Ouvrir le menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  )
}
