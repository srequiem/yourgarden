'use client'

import type { Editor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect, useRef } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/features/ui-feedback/hooks/useToast'

import { uploadImage } from '../../lib/uploadImage'
import { createExtensions, type ImageDropHandler } from './extensions'
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
 * Architecture du drop/paste d'images :
 *
 *   PostEditor possède un `imageDropRef` — un ref React qui pointe vers la fonction
 *   d'upload courante (ou null en mode lecture). Ce ref est passé à `createExtensions`
 *   au mount, et le plugin ProseMirror le lit à chaque événement drop/paste.
 *
 *   Cycle de vie :
 *     1. Au mount : on crée les extensions UNE SEULE FOIS avec le ref.
 *     2. À chaque render : on met à jour `imageDropRef.current` pour que le handler
 *        ait toujours accès au dernier `user`, `editor`, `editable`.
 *     3. Au drop/paste : le plugin lit `imageDropRef.current`, appelle le handler s'il
 *        existe, sinon ignore silencieusement.
 *
 *   Avantages :
 *     - Zéro re-création d'extensions (= zéro re-init de TipTap, pas de perte de focus).
 *     - Zéro dépendance circulaire (le handler accède à l'editor via un ref, pas via
 *       une closure figée à la création).
 *     - Propre à tester : les extensions sont pures, le handler est injectable.
 *
 * Autres points importants :
 *
 *   `immediatelyRender: false` — OBLIGATOIRE avec Next.js App Router. Sans ça, TipTap
 *   essaie de rendre l'éditeur côté serveur, ce qui casse l'hydratation.
 *
 *   Non-contrôlé après le mount. Le prop `content` sert uniquement de valeur initiale.
 *   Pour charger un autre post, passer une `key` différente au composant depuis le parent.
 *
 *   Le mode lecture réutilise EXACTEMENT le même composant (`editable={false}`). Ça
 *   garantit qu'on n'a jamais de divergence de rendu entre "mon post" et "le post
 *   que je regarde chez quelqu'un d'autre" — un seul arbre de composants.
 */

export const PostEditor = ({ content, editable, onChange, onReady }: PostEditorProps) => {
  const { user } = useAuth()
  const { showToast } = useToast()

  // --- Refs stables ---

  const editorRef = useRef<Editor | null>(null)
  const imageDropRef = useRef<ImageDropHandler | null>(null)

  // Extensions créées une seule fois. Le plugin lit imageDropRef.current au runtime,
  // pas à la création — donc on n'a jamais besoin de recréer les extensions.
  const extensionsRef = useRef(createExtensions(imageDropRef))

  // --- Editor ---

  const editor = useEditor({
    extensions: extensionsRef.current,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange?.(instance.getJSON()),
  })

  // Synchronise editorRef à chaque changement d'editor.
  useEffect(() => {
    editorRef.current = editor ?? null
  }, [editor])

  // Met à jour le handler de drop/paste à chaque render.
  // Si pas editable ou pas de user, le handler est null → le plugin ignore les drops.
  imageDropRef.current =
    editable && user
      ? (files: File[]) => {
        const currentEditor = editorRef.current
        if (!currentEditor) return

        files.forEach((file) => {
          void uploadImage(file, user.id)
            .then((url) => {
              currentEditor.chain().focus().setImage({ src: url }).run()
            })
            .catch((error) => {
              const message = error instanceof Error ? error.message : "Échec de l'upload de l'image."
              showToast(message)
            })
        })
      }
      : null

  // --- Side effects ---

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  useEffect(() => {
    if (editor && onReady) onReady(editor)
  }, [editor, onReady])

  return <EditorContent editor={editor} className={styles.editor} />
}
