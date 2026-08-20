'use client'

import { useCallback, useState } from 'react'

import type { JSONContent } from '@tiptap/core'

/*
 * Machine à états read/edit d'un post, pour le propriétaire.
 *
 * Philosophie produit : un post est d'abord un souvenir qu'on relit (mode lecture),
 * pas un formulaire. L'édition est l'exception, activée par un geste explicite.
 *
 * Règles :
 *   - Post vide (fraîchement créé) → on démarre en édition, sinon l'utilisateur
 *     atterrit sur une page blanche sans savoir quoi faire.
 *   - Post avec du contenu → on démarre en lecture (rendu apaisé, pas de toolbar).
 *   - enterEdit / exitToRead : bascules explicites, câblées à un double-clic (desktop),
 *     un bouton "Modifier" (mobile), un bouton "Terminé", et un clic extérieur.
 *
 * Ce hook ne s'occupe QUE de l'état de mode. Il ne décide pas qui a le droit d'éditer
 * (ça reste isReallyOwner côté page) ni comment on sauvegarde (usePost).
 */

export enum PostMode {
  Read = 'read',
  Edit = 'edit',
}

/**
 * Détecte si un doc TipTap est "vide" : pas de texte, pas d'image, juste la structure
 * par défaut (un doc avec un paragraphe vide).
 */
const isDocEmpty = (doc: JSONContent): boolean => {
  const content = doc.content
  if (!content || content.length === 0) return true
  if (content.length === 1) {
    const only = content[0]
    return only?.type === 'paragraph' && !only.content
  }
  return false
}

export const usePostMode = (initialContent: JSONContent) => {
  // On calcule l'état initial une seule fois, au premier rendu, via l'initializer de useState.
  const [mode, setMode] = useState<PostMode>(() =>
    isDocEmpty(initialContent) ? PostMode.Edit : PostMode.Read,
  )

  const enterEdit = useCallback((): void => setMode(PostMode.Edit), [])
  const exitToRead = useCallback((): void => setMode(PostMode.Read), [])

  return { mode, enterEdit, exitToRead }
}