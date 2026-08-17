import type { JSONContent } from '@tiptap/core'

/**
 * Doc TipTap vide de base : un doc contenant un paragraphe vide.
 * Sert de valeur par défaut à la création d'un nouveau post.
 * TipTap ne sait pas ouvrir un doc totalement vide (pas de content) — il faut au moins ça.
 */
export const createEmptyDoc = (): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
})
