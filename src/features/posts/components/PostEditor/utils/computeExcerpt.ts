import type { JSONContent } from '@tiptap/core'

/*
 * Extrait le texte plat d'un doc TipTap pour construire un excerpt.
 *
 * On parcourt récursivement l'arbre de blocs et on concatène tous les `text` rencontrés,
 * séparés par des espaces. On tronque à ~180 caractères pour tenir dans une card sans
 * effort de layout.
 *
 * NB : on ignore volontairement les blocs `heading`, `image` et `video` — l'excerpt sert
 * uniquement à donner un aperçu textuel du contenu narratif.
 */

const MAX_LENGTH = 180

const collectText = (node: JSONContent, buffer: string[]): void => {
  if (node.type === 'text' && typeof node.text === 'string') {
    buffer.push(node.text)
    return
  }
  if (Array.isArray(node.content)) {
    node.content.forEach((child) => collectText(child, buffer))
  }
}

export const computeExcerpt = (doc: JSONContent): string => {
  const buffer: string[] = []
  collectText(doc, buffer)

  const raw = buffer.join(' ').replace(/\s+/g, ' ').trim()
  if (raw.length <= MAX_LENGTH) return raw

  return `${raw.slice(0, MAX_LENGTH).trimEnd()}…`
}
