'use client'

import { useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Spacer } from '@/components/ui/Spacer'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/features/ui-feedback/hooks/useToast'

import { uploadImage } from '../../lib/uploadImage'
import { ColorHighlightPopover } from './ColorHighlightPopover'
import styles from './EditorToolbar.module.css'

interface EditorToolbarProps {
  editor: Editor | null
}

/*
 * Toolbar de l'éditeur.
 *
 * Groupes : marques de texte (gras, italique, souligné, barré) — titres (H1, H2) —
 * blocs (surbrillance, liste, citation, séparateur) — puis, après un Spacer qui avale
 * l'espace restant, l'insertion d'image collée à droite.
 *
 * Chaque bouton affiche un état actif quand la marque/nœud correspondant est sous le curseur.
 * TipTap expose ça via `editor.isActive('bold')` etc., ce qui est bien plus fiable que
 * `document.queryCommandState` de l'ancien execCommand.
 *
 * `useEditorState` est indispensable ici : la toolbar reçoit l'instance de l'éditeur une
 * seule fois (via onReady) et React n'a aucune raison de la re-rendre quand le curseur se
 * déplace. Sans ce hook, les états actifs ne se rafraîchissaient qu'au prochain changement
 * de contenu — donc jamais sur un simple déplacement de sélection. Le selector ne renvoie
 * que des booléens, comparés en surface : pas de re-render à chaque frappe.
 *
 * Le bouton image ouvre un file picker natif (input type="file" caché).
 * Au choix d'un fichier, on uploade vers Supabase Storage et on insère le bloc image.
 * Le drag & drop est géré séparément dans le plugin ProseMirror de PostEditor.
 */

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      isBold: instance?.isActive('bold') ?? false,
      isItalic: instance?.isActive('italic') ?? false,
      isUnderline: instance?.isActive('underline') ?? false,
      isStrike: instance?.isActive('strike') ?? false,
      isH1: instance?.isActive('heading', { level: 1 }) ?? false,
      isH2: instance?.isActive('heading', { level: 2 }) ?? false,
      isBulletList: instance?.isActive('bulletList') ?? false,
      isBlockquote: instance?.isActive('blockquote') ?? false,
    }),
  })

  if (!editor || !state) return null

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files
    if (!files?.length || !user) return

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file, user.id)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Échec de l'upload de l'image."
        showToast(message)
      }
    }

    // Reset l'input pour pouvoir re-sélectionner le même fichier si besoin.
    event.target.value = ''
  }

  return (
    <div className={styles.toolbar}>
      <Button
        variant={ButtonVariant.Icon}
        title="Gras"
        className={state.isBold ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Italique"
        className={state.isItalic ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Souligné"
        className={state.isUnderline ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Barré"
        className={state.isStrike ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </Button>

      <span className={styles.divider} />

      <Button
        variant={ButtonVariant.Icon}
        title="Titre 1"
        className={state.isH1 ? styles.active : ''}
        style={{ fontFamily: 'var(--font-heading)' }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Titre 2"
        className={state.isH2 ? styles.active : ''}
        style={{ fontFamily: 'var(--font-heading)' }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>

      <span className={styles.divider} />

      <ColorHighlightPopover editor={editor} />
      <Button
        variant={ButtonVariant.Icon}
        title="Liste"
        className={state.isBulletList ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        ••
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Citation"
        className={state.isBlockquote ? styles.active : ''}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </Button>
      <Button
        variant={ButtonVariant.Icon}
        title="Séparateur"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        &mdash;
      </Button>

      <Spacer />

      <Button
        variant={ButtonVariant.Icon}
        title="Ajouter une image"
        style={{ color: 'var(--color-accent)' }}
        onClick={() => fileInputRef.current?.click()}
      >
        ▣
      </Button>

      {/* Input caché : déclenché par le bouton au-dessus */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(event) => void onFileChange(event)}
        style={{ display: 'none' }}
      />
    </div>
  )
}
