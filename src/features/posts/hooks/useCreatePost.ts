'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'

import { postsRepository } from '../lib/postsRepository'

/*
 * Hook de création d'une publication.
 *
 * Flow "à la Notion" :
 *   1. Clic "Ajouter" → on crée immédiatement un post vide en base (title vide, doc vide, privé).
 *   2. On redirige vers /{username}/p/{id} — l'utilisateur atterrit directement dans l'éditeur.
 *   3. Autosave prend le relais dès la première frappe.
 *
 * Il n'y a donc jamais de flow "brouillon → sauvegarde manuelle" : le post existe
 * dès qu'on clique, ce qui garantit qu'on ne perd jamais rien.
 */

export const useCreatePost = () => {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('User non connecté')
      return postsRepository.create({ userId: user.id })
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts', post.userId] })
      if (user) router.push(`/${user.username}/p/${post.id}`)
    },
  })

  const create = useCallback((): void => {
    mutation.mutate()
  }, [mutation])

  return { create, isPending: mutation.isPending }
}
