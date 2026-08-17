'use client'

import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { getBrowserSupabase } from '@/lib/supabase/browser'

import type { LoginCredentials, RegisterCredentials, User } from '../types'

/*
 * Hook d'authentification — version Supabase.
 *
 * Ce hook fait trois choses :
 *
 * 1. Expose `user` (notre type métier, avec username et name) et `isReady` (true dès que
 *    Supabase a répondu, même si personne n'est connecté).
 *
 * 2. Expose `login`, `register`, `logout` — les seules actions du domaine auth.
 *
 * 3. Synchronise l'état user avec Supabase en temps réel :
 *    - Au mount : on lit la session courante (posée par le middleware serveur dans les cookies)
 *      et on charge le profil correspondant depuis la table profiles.
 *    - Ensuite : on écoute onAuthStateChange pour réagir aux login/logout/refresh de token,
 *      y compris ceux qui se produisent dans d'autres onglets ou depuis le serveur.
 *
 * Le user final est la FUSION de deux sources :
 *   - auth.users (Supabase Auth) → id, email
 *   - public.profiles (nous) → username, name
 * On les combine dans hydrateUser() ci-dessous.
 */

interface AuthContextValue {
  user: User | null
  isReady: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Compose notre User métier à partir d'un utilisateur Supabase Auth + son profil.
 * Renvoie null si le profil n'existe pas (ne devrait pas arriver grâce au trigger,
 * mais on gère le cas défensivement).
 */
const hydrateUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  const supabase = getBrowserSupabase()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, name')
    .eq('id', supabaseUser.id)
    .single()

  if (error || !profile) return null

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    username: profile.username,
    name: profile.name,
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const supabase = getBrowserSupabase()

    // Fonction commune : à partir d'une session, on met à jour le user.
    const syncFromSession = async (session: Session | null): Promise<void> => {
      if (!session?.user) {
        setUser(null)
        return
      }
      const hydrated = await hydrateUser(session.user)
      setUser(hydrated)
    }

    // 1. Chargement initial : on demande la session courante à Supabase.
    //    Elle vient des cookies posés par le middleware, donc c'est instantané (pas de round-trip HTTP).
    void supabase.auth.getSession().then(async ({ data }) => {
      await syncFromSession(data.session)
      setIsReady(true)
    })

    // 2. Abonnement aux changements : login, logout, refresh de token, session dans un autre onglet.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncFromSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    const supabase = getBrowserSupabase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Aucun utilisateur retourné après connexion.')

    // Le onAuthStateChange va aussi se déclencher et mettre à jour le state,
    // mais on hydrate immédiatement pour renvoyer le user à l'appelant (qui en a besoin
    // pour la redirection /{username}).
    const hydrated = await hydrateUser(data.user)
    if (!hydrated) throw new Error('Profil introuvable.')

    setUser(hydrated)
    return hydrated
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
    const supabase = getBrowserSupabase()

    // On passe username et name via user_metadata → le trigger côté BDD les récupère
    // dans raw_user_meta_data pour créer la ligne profiles automatiquement.
    // emailRedirectTo indique où Supabase renverra l'utilisateur après clic sur le lien
    // de confirmation de son email.
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          username: credentials.username,
          name: credentials.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    // Volontairement pas de setUser ici : avec "Confirm email" activé, la session n'existe
    // pas encore. Le user devra cliquer le lien dans l'email pour être vraiment connecté.
    // Le RegisterForm affiche un message "check your email" plutôt qu'une redirection.
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    const supabase = getBrowserSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
