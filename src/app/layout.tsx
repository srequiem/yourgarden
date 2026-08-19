import type { Metadata } from 'next'
import { Caprasimo, Figtree } from 'next/font/google'
import type { ReactNode } from 'react'

import { AmbientBackdrop } from '@/components/ui/AmbientBackdrop'

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
      {/*
       * Monté ici, au-dessus de Providers, pour deux raisons : le décor doit être présent
       * sur *toutes* les routes (auth comprise), et il doit être le premier élément peint
       * dans le body pour que les surfaces en verre le captent dans leur backdrop.
       */}
      <AmbientBackdrop />
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
