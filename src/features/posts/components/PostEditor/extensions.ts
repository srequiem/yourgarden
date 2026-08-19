import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import type { MutableRefObject } from 'react'

/*
 * Config des extensions TipTap.
 *
 * StarterKit apporte le nécessaire : doc, paragraph, text, heading, bold, italic, strike,
 * bulletList, orderedList, blockquote, codeBlock, horizontalRule, history (undo/redo), etc.
 *
 * On restreint volontairement les niveaux de titre à H1/H2/H3 (pas H4-H6 : personne
 * n'en a besoin dans un journal perso, et ça complique la hiérarchie visuelle).
 *
 * Underline : entré dans le StarterKit avec la v3, on ne le déclare donc plus à la main
 * (le paquet @tiptap/extension-underline a été retiré des dépendances). Strike y était déjà.
 * La v3 y ajoute aussi Link, ListKeymap et TrailingNode, laissés actifs par défaut.
 *
 * Highlight en `multicolor: true` : la marque porte alors un attribut `color`, ce qui permet
 * au ColorHighlightPopover de proposer une palette plutôt qu'un unique jaune. On stocke des
 * valeurs hex en dur (et non des `var(--token)`) parce que cette couleur est persistée dans
 * le JSONContent du post : elle doit rester lisible même si les tokens du thème changent.
 *
 * Image + drag & drop :
 *   Le plugin ProseMirror qui gère le drop/paste ne reçoit pas un callback figé à la création.
 *   Il reçoit un MutableRefObject<ImageDropHandler | null> — un ref React stable dont la
 *   valeur `.current` est mise à jour par le composant PostEditor quand ses dépendances
 *   (user, editable) changent. Résultat :
 *     - Les extensions sont créées UNE SEULE FOIS (pas de useMemo, pas de re-init TipTap).
 *     - Le handler a toujours accès à la dernière instance de l'editor, du user, etc.
 *     - Quand editable === false, le ref vaut null → le plugin ignore silencieusement.
 *   C'est le pattern standard pour injecter du comportement React dans ProseMirror sans
 *   coupler les deux mondes.
 *
 * Placeholder : affiche un texte gris quand un paragraphe est vide (celui du haut si le doc
 * est vierge). Comportement inspiré directement de Notion.
 */

export type ImageDropHandler = (files: File[]) => void

/**
 * Extrait les fichiers image depuis un DataTransfer (drop ou paste).
 */
const extractImageFiles = (dataTransfer: DataTransfer | null): File[] => {
  if (!dataTransfer?.files?.length) return []
  return Array.from(dataTransfer.files).filter((file) => file.type.startsWith('image/'))
}

/**
 * Crée le set d'extensions. Appelé UNE SEULE FOIS au mount du composant.
 *
 * Le `handlerRef` est un ref React : sa valeur `.current` est lue au moment de l'événement
 * (pas à la création du plugin). Ça casse le cycle de dépendance
 * onImageDrop → editor → extensions → onImageDrop sans recréer les extensions.
 */
export const createExtensions = (handlerRef: MutableRefObject<ImageDropHandler | null>) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Highlight.configure({ multicolor: true }),
  Image.configure({
    inline: false,
    allowBase64: false,
    /*
     * Redimensionnement natif (v3 uniquement — l'option n'existe pas en v2).
     *
     * On n'expose que les poignées latérales et les deux coins bas : les poignées du
     * haut obligeraient à tirer vers le haut contre le sens de lecture, et dans un
     * texte qui défile c'est le geste le plus inconfortable.
     *
     * `alwaysPreserveAspectRatio` évite qu'une photo puisse être écrasée par accident —
     * dans un carnet personnel on veut réduire une image, jamais la déformer.
     *
     * minWidth à 120 : en dessous, la vignette ne dit plus rien de son contenu.
     *
     * ATTENTION : les poignées natives sont livrées SANS dimensions (l'implémentation
     * ne pose qu'un `position: absolute` et un `data-resize-handle`). Elles sont donc
     * inutilisables tant que le CSS ne leur donne pas de taille — voir la section
     * correspondante dans PostEditor.module.css. Ce n'est pas du décor, c'est ce qui
     * rend la fonctionnalité saisissable.
     */
    resize: {
      enabled: true,
      directions: ['left', 'right', 'bottom-left', 'bottom-right'],
      minWidth: 120,
      alwaysPreserveAspectRatio: true,
    },
  }).extend({
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('imageDrop'),
          props: {
            handleDrop: (_view, event) => {
              const handler = handlerRef.current
              if (!handler) return false

              const files = extractImageFiles(event.dataTransfer)
              if (files.length === 0) return false

              event.preventDefault()
              handler(files)
              return true
            },
            handlePaste: (_view, event) => {
              const handler = handlerRef.current
              if (!handler) return false

              const files = extractImageFiles(event.clipboardData)
              if (files.length === 0) return false

              event.preventDefault()
              handler(files)
              return true
            },
          },
        }),
      ]
    },
  }),
  Placeholder.configure({
    placeholder: 'Écrivez ici, aussi simplement que sur une page blanche…',
  }),
]
