'use client'

import { useQuery } from '@tanstack/react-query'

import { postsRepository } from '../lib/postsRepository'

/*
 * usePosts : tous les posts d'un user (privés + publics).
 * Utilisé par le propriétaire connecté sur son propre blog.
 * RLS garantit que les posts privés ne sont visibles que par le propriétaire.
 */
export const usePosts = (userId: string | null) => {
  return useQuery({
    queryKey: ['posts', userId] as const,
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return postsRepository.listByUser(userId)
    },
    enabled: Boolean(userId),
  })
}

/*
 * usePublicPosts : uniquement les posts publics d'un user.
 * Utilisé par la page publique du blog (visiteur non-connecté ou connecté mais pas propriétaire).
 * Le userId ici est l'id du propriétaire du blog visité, pas du visiteur.
 */
export const usePublicPosts = (userId: string | null) => {
  return useQuery({
    queryKey: ['posts', userId, 'public'] as const,
    queryFn: () => {
      if (!userId) return Promise.resolve([])
      return postsRepository.listPublicByUser(userId)
    },
    enabled: Boolean(userId),
  })
}
