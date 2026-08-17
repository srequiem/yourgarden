'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { AuthProvider } from '@/features/auth/hooks/useAuth'

/*
 * Wrapper de tous les providers client-side.
 *
 * Isolé dans son propre fichier "use client" pour que le layout racine (src/app/layout.tsx)
 * puisse rester server component — c'est la meilleure pratique Next 15 pour éviter que TOUT
 * ne devienne client-side par cascade.
 *
 * Le QueryClient est instancié une seule fois via useState (pattern officiel TanStack Query
 * pour App Router : sinon on recrée le client à chaque render et on perd le cache).
 */

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Défauts raisonnables : on ne re-fetch pas à chaque focus de fenêtre pour un journal perso.
            refetchOnWindowFocus: false,
            staleTime: 10_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
