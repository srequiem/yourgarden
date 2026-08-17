import type { JSONContent } from '@tiptap/core'

/*
 * Trouve la source (`src`) de la première image du doc TipTap, en parcourant l'arbre.
 * Utilisée pour donner une illustration aux cards de publication sur la home.
 * Renvoie null si aucune image n'est trouvée — la card fallback sur un placeholder texte.
 */

const walk = (node: JSONContent): string | null => {
  if (node.type === 'image' && typeof node.attrs?.src === 'string') {
    return node.attrs.src
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const found = walk(child)
      if (found) return found
    }
  }
  return null
}

export const findCoverImage = (doc: JSONContent): string | null => walk(doc)
