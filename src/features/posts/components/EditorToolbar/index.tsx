'use client'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Spacer } from '@/components/ui/Spacer'

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
 * L'insertion d'image par URL est un placeholder : on demande une URL avec `prompt()`.
 * Version 2 : bouton "Ajouter une image" qui ouvre un file picker, upload vers Supabase
 * Storage, insère un bloc image avec le storage_path retourné. Pour l'instant, coller un
 * lien direct suffit à débloquer le développement.
 */

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
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

  const insertImage = (): void => {
    const url = window.prompt("Coller l'URL de l'image (fichier upload à venir)")
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
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
        onClick={insertImage}
      >
        ▣
      </Button>
    </div>
  )
}
