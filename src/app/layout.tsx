import type { Metadata } from 'next'
import { Caprasimo, Figtree } from 'next/font/google'
import type { ReactNode } from 'react'

import { Providers } from './providers'
import './globals.css'

/*
 * Layout racine (Server Component).
 *
 * On charge les fonts via next/font pour :
 *   - qu'elles soient self-hosted (aucune requête vers Google Fonts au runtime),
 *   - qu'elles évitent le FOUT et le layout shift,
 *   - qu'on puisse les exposer sous forme de CSS variables (--font-heading-src / --font-body-src)
 *     que globals.css réutilise dans --font-heading et --font-body.
 */

const caprasimo = Caprasimo({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-heading-src',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-body-src',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'yourgarden',
  description: 'Votre carnet personnel. Privé par défaut.',
  icons: { icon: '/favicon.svg' },
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="fr" className={`${caprasimo.variable} ${figtree.variable}`}>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
