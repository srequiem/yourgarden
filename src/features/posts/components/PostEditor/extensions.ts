import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'

/*
 * Config des extensions TipTap.
 *
 * StarterKit apporte le nécessaire : doc, paragraph, text, heading, bold, italic, strike,
 * bulletList, orderedList, blockquote, codeBlock, horizontalRule, history (undo/redo), etc.
 *
 * On restreint volontairement les niveaux de titre à H1/H2/H3 (pas H4-H6 : personne
 * n'en a besoin dans un journal perso, et ça complique la hiérarchie visuelle).
 *
 * Underline : PAS dans le StarterKit en TipTap v2 (il n'y entre qu'en v3), il faut donc
 * l'ajouter à la main. Strike, lui, y est déjà — pas besoin de le déclarer.
 *
 * Highlight en `multicolor: true` : la marque porte alors un attribut `color`, ce qui permet
 * au ColorHighlightPopover de proposer une palette plutôt qu'un unique jaune. On stocke des
 * valeurs hex en dur (et non des `var(--token)`) parce que cette couleur est persistée dans
 * le JSONContent du post : elle doit rester lisible même si les tokens du thème changent.
 *
 * Image : bloc (pas inline). Quand on ajoutera l'upload, on écrira une extension custom
 * qui prend un fichier, l'upload vers Storage, puis insère un bloc image avec le
 * storage_path retourné. Pour l'instant on peut coller une URL manuellement.
 *
 * Placeholder : affiche un texte gris quand un paragraphe est vide (celui du haut si le doc
 * est vierge). Comportement inspiré directement de Notion.
 */

export const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Highlight.configure({ multicolor: true }),
  Image.configure({ inline: false, allowBase64: false }),
  Placeholder.configure({
    placeholder: 'Écrivez ici, aussi simplement que sur une page blanche…',
  }),
]
