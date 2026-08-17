'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { AuthPage } from '@/features/auth/pages/AuthPage'
import { useAuth } from '@/features/auth/hooks/useAuth'

/*
 * Page d'accueil de l'app.
 *
 * Comportement selon l'état de la session :
 *   - Session non chargée (isReady === false)     → on affiche rien pour éviter un flash.
 *   - Session vide (pas connecté)                 → on affiche AuthPage.
 *   - Session présente                            → on redirige silencieusement vers /{username}.
 *
 * NB : la redirection se fait via useEffect + router.replace pour ne pas la faire pendant
 * le render (React s'y opposerait). replace() plutôt que push() pour ne pas polluer l'historique.
 */

const HomePage = () => {
  const { user, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isReady && user) {
      router.replace(`/${user.username}`)
    }
  }, [isReady, user, router])

  if (!isReady) return null
  if (user) return null
  return <AuthPage />
}

export default HomePage
