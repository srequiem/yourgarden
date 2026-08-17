'use client'

import { useQuery } from '@tanstack/react-query'

import { postsRepository } from '../lib/postsRepository'

/*
 * Hook de liste des publications d'un utilisateur.
 *
 * Filtre optionnel par `kind` (portfolio | journal). Trié par updatedAt descendant
 * (le plus récent en premier) — logique déjà appliquée dans le repository.
 *
 * NB : pour l'instant on retourne TOUS les posts (privés + publics). C'est au composant
 * consommateur (PostGrid dans la page publique par exemple) de filtrer selon si l'utilisateur
 * connecté est le propriétaire ou non. Quand Supabase arrivera, cette logique passera au
 * niveau Row Level Security côté BDD : un visiteur non-owner ne verra JAMAIS les posts privés,
 * même s'il essaie.
 */

const postsKey = (userId: string): readonly [string, string] => ['posts', userId] as const

export const usePosts = (userId: string | null) => {
  return useQuery({
    queryKey: postsKey(userId ?? ''),
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return postsRepository.listByUser(userId)
    },
    enabled: Boolean(userId),
  })
}
