'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { readJson, removeKey, writeJson } from '@/lib/storage'

import { AuthMode, type AuthCredentials, type User } from '../types'

/*
 * Hook d'authentification.
 *
 * Version MVP entièrement mockée en localStorage — aucun serveur, aucun hash, aucune sécurité.
 * L'objectif à ce stade est uniquement de simuler le flow (inscription → session → déconnexion)
 * pour pouvoir développer le reste du produit. Le remplacement par Supabase Auth se fera
 * en changeant *uniquement* le corps de `authenticate` et de `logout`, sans toucher aux
 * composants qui consomment `useAuth` (c'est tout l'intérêt de la couche hook).
 *
 * Adaptations Next.js :
 * - `use client` obligatoire : on utilise useState/useEffect/useContext.
 * - On lit localStorage dans un useEffect, pas dans l'initializer de useState, sinon crash SSR.
 *   Conséquence : un flash "non connecté" au premier rendu. On y remédie plus tard avec un
 *   petit loader / squelette si nécessaire.
 */

const STORAGE_KEY = 'yourgarden.user'

interface AuthContextValue {
  user: User | null
  isReady: boolean
  authenticate: (mode: AuthMode, credentials: AuthCredentials) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Dérive un username à partir de l'email pour le mock.
 * Ex: "sacha.requiem@gmail.com" → "sacha-requiem"
 * On sanitise pour rester compatible avec un slug d'URL.
 */
const deriveUsernameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0] ?? 'moi'
  return localPart
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Première lecture localStorage côté client uniquement.
    setUser(readJson<User>(STORAGE_KEY))
    setIsReady(true)
  }, [])

  const authenticate = useCallback(
    async (mode: AuthMode, credentials: AuthCredentials): Promise<User> => {
      const displayName =
        mode === AuthMode.Register && credentials.name
          ? credentials.name
          : (credentials.email.split('@')[0] ?? 'Moi')

      const nextUser: User = {
        id: crypto.randomUUID(),
        username: deriveUsernameFromEmail(credentials.email),
        name: displayName,
        email: credentials.email,
      }

      writeJson(STORAGE_KEY, nextUser)
      setUser(nextUser)
      return nextUser
    },
    [],
  )

  const logout = useCallback((): void => {
    removeKey(STORAGE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isReady, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
