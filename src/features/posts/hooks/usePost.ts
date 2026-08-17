'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JSONContent } from '@tiptap/core'
import { useCallback, useEffect, useRef, useState } from 'react'

import { postsRepository } from '../lib/postsRepository'
import type { Post, UpdatePostInput } from '../types'

/*
 * Hook de chargement + édition d'une publication.
 *
 * Responsabilités :
 *   - Charger le post via TanStack Query (invalidation, cache par postId).
 *   - Fournir un `saveTitle` et `saveContent` avec debounce ~1500ms (autosave silencieuse).
 *   - Fournir un `setVisibility` immédiat (le bouton "Rendre public" doit répondre instantanément).
 *   - Fournir un `deletePost` (suppression définitive, sans debounce évidemment).
 *   - Exposer un statut simple (`isSaving`) pour afficher un discret "Enregistrement…".
 *
 * Convention Sacha appliquée :
 *   - Utilisation de TanStack Query car il est déjà présent dans le projet.
 *   - Debounce codé à la main avec setTimeout + ref, sans lib externe.
 *   - Le pattern est réutilisable : chaque hook `save*` remplace son timer précédent
 *     avant d'en programmer un nouveau, ce qui garantit qu'une salve rapide de frappes
 *     n'entraîne qu'un seul PATCH final (comportement identique à Notion / Google Docs).
 */

const AUTOSAVE_DELAY_MS = 1500

const postKey = (postId: string): readonly ['post', string] => ['post', postId]

export const usePost = (postId: string) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: postKey(postId),
    queryFn: () => postsRepository.get(postId),
    // Un post n'est pas modifié par d'autres users dans notre modèle (privé par défaut),
    // donc on peut se permettre un staleTime généreux.
    staleTime: 30_000,
  })

  const mutation = useMutation({
    mutationFn: (patch: UpdatePostInput) => postsRepository.update(postId, patch),
    onSuccess: (updated: Post) => {
      queryClient.setQueryData(postKey(postId), updated)
    },
  })

  // -- Autosave debounced --
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const scheduleSave = useCallback(
    (patch: UpdatePostInput): void => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setIsSaving(true)
      timerRef.current = setTimeout(() => {
        mutation.mutate(patch, {
          onSettled: () => setIsSaving(false),
        })
      }, AUTOSAVE_DELAY_MS)
    },
    [mutation],
  )

  // Cleanup : si le composant est démonté avant que le timer ne tire, on flush.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const saveContent = useCallback(
    (content: JSONContent) => scheduleSave({ content }),
    [scheduleSave],
  )
  const saveTitle = useCallback((title: string) => scheduleSave({ title }), [scheduleSave])

  const setVisibility = useCallback(
    async (visibility: 'private' | 'public'): Promise<void> => {
      await mutation.mutateAsync({ visibility })
    },
    [mutation],
  )

  // -- Suppression --
  //
  // Passe par `postsRepository.remove`, seul endroit qui sait où vivent les posts. Le jour
  // du branchement Supabase, cette méthode devient un `.delete().eq('id', id)` et rien
  // ici ne bouge — d'où le `mutateAsync` (on attend vraiment le retour serveur avant de
  // rediriger) et le fait qu'on remonte `deleteError` : une suppression réseau peut échouer,
  // et une règle RLS peut carrément la refuser. Aujourd'hui localStorage n'échoue jamais,
  // mais l'appelant est déjà écrit pour ce cas.
  const authorId = query.data?.userId ?? null

  const deleteMutation = useMutation({
    mutationFn: () => postsRepository.remove(postId),
    onSuccess: () => {
      // setQueryData(null) plutôt que removeQueries : retirer l'entrée déclencherait un
      // refetch immédiat du post qu'on vient de supprimer.
      queryClient.setQueryData(postKey(postId), null)
      if (authorId) queryClient.invalidateQueries({ queryKey: ['posts', authorId] })
    },
  })

  const deletePost = useCallback(async (): Promise<void> => {
    // Indispensable : on annule l'autosave en vol avant de supprimer. Sans ça, un timer
    // armé par la dernière frappe tire ~1,5 s plus tard et tente un update sur un post
    // qui n'existe plus (`Post {id} introuvable` côté localStorage, 404 côté Supabase).
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsSaving(false)

    await deleteMutation.mutateAsync()
  }, [deleteMutation])

  return {
    post: query.data ?? null,
    isLoading: query.isLoading,
    isSaving,
    saveTitle,
    saveContent,
    setVisibility,
    deletePost,
    // `|| isSuccess` volontaire : le flag doit rester vrai entre la fin de la suppression
    // et la redirection, sinon la page repasse une frame par "Publication introuvable".
    isDeleting: deleteMutation.isPending || deleteMutation.isSuccess,
    deleteError: deleteMutation.error,
  }
}
