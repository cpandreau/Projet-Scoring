import { redirect } from 'next/navigation'
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
  SolutionSection,
} from '@/components/landing'
import { PublicLayout } from '@/components/public'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Show landing page for non-authenticated users
  // Flow: Hero (sombre) → Problème (clair) → Solution (sombre) → Comment ça marche (clair) → Piliers (sombre) → CTA (clair)
  return (
    <PublicLayout headerVariant="transparent">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CtaSection />
    </PublicLayout>
  )
}
