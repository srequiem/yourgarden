'use client'

import type { Editor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'

import { extensions } from './extensions'
import styles from './PostEditor.module.css'

interface PostEditorProps {
  /** Doc TipTap initial. Le composant est non-contrôlé après le mount (voir note plus bas). */
  content: JSONContent
  /** True = édition, False = lecture pure (mode visiteur ou owner déconnecté). */
  editable: boolean
  /** Appelé à chaque modification. Le parent l'utilise pour l'autosave debounced. */
  onChange?: (doc: JSONContent) => void
  /** Callback appelé quand l'instance TipTap est prête. Permet au parent de brancher la toolbar. */
  onReady?: (editor: Editor) => void
}

/*
 * Wrapper React autour de TipTap.
 *
 * Points importants :
 *
 * 1. `immediatelyRender: false` — OBLIGATOIRE avec Next.js App Router. Sans ça, TipTap
 *    essaie de rendre l'éditeur côté serveur, ce qui casse l'hydratation (mismatch entre
 *    HTML serveur et DOM client). Avec false, le premier rendu SSR est vide, puis TipTap
 *    monte l'éditeur côté client. Léger flash mais correct.
 *
 * 2. Non-contrôlé après le mount. TipTap gère son propre état interne (c'est son job).
 *    Le prop `content` sert uniquement de valeur initiale. Si on veut forcer un rebuild
 *    (charger un autre post par exemple), on doit passer une `key` au composant depuis
 *    le parent — sinon TipTap garde l'ancien contenu à l'écran.
 *
 * 3. Le mode lecture réutilise EXACTEMENT le même composant en passant `editable={false}`.
 *    C'est ce qui garantit qu'on n'a jamais de divergence de rendu entre "mon post"
 *    et "le post que je regarde chez quelqu'un d'autre" — c'est un seul et même arbre.
 *
 * 4. On observe `editable` avec un useEffect pour pouvoir basculer sans démonter l'éditeur
 *    (utile si le user se connecte/déconnecte pendant qu'il regarde son propre post).
 */

export const PostEditor = ({ content, editable, onChange, onReady }: PostEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange?.(instance.getJSON()),
  })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  useEffect(() => {
    if (editor && onReady) onReady(editor)
  }, [editor, onReady])

  return <EditorContent editor={editor} className={styles.editor} />
}
