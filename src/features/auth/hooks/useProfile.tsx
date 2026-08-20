'use client'

import { useQuery } from '@tanstack/react-query'

import { getProfileByUsername } from '../lib/profilesRepository'

/*
 * Résout un username (depuis l'URL) vers le profil public correspondant.
 *
 * C'est la pièce qui manquait : la page /{username} part d'un username, mais pour charger
 * les posts il faut l'id du propriétaire. Ce hook fait le pont username → profil (dont id).
 *
 * Fonctionne pour tout le monde (visiteur ou propriétaire) grâce à la policy RLS de lecture
 * publique des profils.
 */
export const useProfile = (username: string) => {
  return useQuery({
    queryKey: ['profile', username.toLowerCase()] as const,
    queryFn: () => getProfileByUsername(username),
    // Un profil ne change quasiment jamais : on peut garder en cache longtemps.
    staleTime: 60_000,
  })
}
