/*
 * Accès en lecture aux profils publics.
 *
 * Sert à résoudre un username (venu de l'URL /{username}) vers le profil correspondant,
 * notamment son id — nécessaire pour aller chercher les posts de CE user précis, qu'on
 * soit le propriétaire ou un simple visiteur.
 *
 * La lecture est autorisée pour tout le monde (policy RLS "profiles are readable by everyone"),
 * donc pas besoin d'être connecté.
 */

import { getBrowserSupabase } from '@/lib/supabase/browser'

export interface PublicProfile {
  id: string
  username: string
  name: string
}

interface RawProfile {
  id: string
  username: string
  name: string
}

const mapProfile = (raw: RawProfile): PublicProfile => ({
  id: raw.id,
  username: raw.username,
  name: raw.name,
})

/**
 * Résout un username (insensible à la casse) vers son profil public.
 * Renvoie null si aucun profil ne correspond (username inexistant).
 */
export const getProfileByUsername = async (username: string): Promise<PublicProfile | null> => {
  const supabase = getBrowserSupabase()

  // ilike = comparaison insensible à la casse, cohérent avec l'index unique lower(username)
  // qu'on a posé sur la table profiles.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, name')
    .ilike('username', username)
    .maybeSingle<RawProfile>()

  if (error) throw error
  if (!data) return null
  return mapProfile(data)
}
