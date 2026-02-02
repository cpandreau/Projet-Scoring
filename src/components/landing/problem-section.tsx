'use client'

import { motion, useReducedMotion } from 'motion/react'

// Simple fade animation
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

export function ProblemSection() {
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-100px' }

  return (
    <section className="relative bg-background">
      {/* Transition gradient from hero */}
      <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

      {/* Main content */}
      <div className="py-16 sm:py-20 lg:py-24">
        <motion.div
          className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : { visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* First block */}
          <motion.div variants={prefersReducedMotion ? undefined : fadeIn} className="space-y-2">
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground leading-snug">
              Vous dirigez une entreprise.
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground leading-relaxed">
              Vous savez que <span className="italic">"ça tourne"</span>…
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl text-foreground leading-relaxed">
              mais est-ce que ça va <span className="font-semibold">vraiment</span> ?
            </p>
          </motion.div>

          {/* Separator */}
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeIn}
            className="my-10 sm:my-12 lg:my-14 flex justify-center"
          >
            <div className="w-10 h-px bg-border" />
          </motion.div>

          {/* Second block */}
          <motion.div variants={prefersReducedMotion ? undefined : fadeIn} className="space-y-2">
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground leading-relaxed">
              Votre comptable vous dit que <span className="italic">"c'est correct"</span>
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground leading-relaxed">
              une fois par an.
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl text-foreground leading-relaxed mt-4">
              Entre-temps, vous naviguez à vue.
            </p>
          </motion.div>

          {/* Separator */}
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeIn}
            className="my-10 sm:my-12 lg:my-14 flex justify-center"
          >
            <div className="w-10 h-px bg-border" />
          </motion.div>

          {/* Third block */}
          <motion.div variants={prefersReducedMotion ? undefined : fadeIn}>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Entre le tableau Excel illisible
              <br />
              et le rendez-vous annuel chez le comptable,
              <br />
              il n'existe rien.
            </p>
          </motion.div>

          {/* Punch line */}
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeIn}
            className="mt-14 sm:mt-16 lg:mt-20"
          >
            <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand">
              Jusqu'à maintenant.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Transition gradient to next section */}
      <div className="h-16 sm:h-24 bg-gradient-to-b from-background to-[#0A0E17]" />
    </section>
  )
}
