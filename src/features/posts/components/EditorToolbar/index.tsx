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
 * Alignements exposés. `left` est traité à part au clic (voir plus bas) : il retire
 * l'attribut au lieu d'en poser un, pour que le cas par défaut ne laisse aucune trace
 * dans le document.
 */
const ALIGNMENTS = [
  { value: 'left', label: 'Aligner à gauche' },
  { value: 'center', label: 'Centrer' },
  { value: 'right', label: 'Aligner à droite' },
] as const

type Alignment = (typeof ALIGNMENTS)[number]['value']

/*
 * Quatre traits dont la longueur et le retrait changent selon l'alignement — la
 * convention universelle pour ces boutons. Dessinés à la main plutôt qu'importés :
 * une dépendance d'icônes entière pour douze segments de droite ne se justifie pas.
 */
const ALIGN_ICON_PATHS: Record<Alignment, string[]> = {
  left: ['M4 6h16', 'M4 10h10', 'M4 14h16', 'M4 18h8'],
  center: ['M4 6h16', 'M7 10h10', 'M4 14h16', 'M8 18h8'],
  right: ['M4 6h16', 'M10 10h10', 'M4 14h16', 'M12 18h8'],
}

const AlignIcon = ({ alignment }: { alignment: Alignment }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    {ALIGN_ICON_PATHS[alignment].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
)

/*
 * Toolbar de l'éditeur.
 *
 * Groupes : marques de texte (gras, italique, souligné, barré) — titres (H1, H2) —
 * alignement (gauche, centre, droite) — blocs (surbrillance, liste, citation, séparateur)
 * — puis, après un Spacer qui avale l'espace restant, l'insertion d'image collée à droite.
 *
 * L'alignement est placé juste après les titres : les deux agissent sur le bloc entier,
 * là où les groupes voisins agissent sur la sélection ou insèrent un élément.
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
      isAlignCenter: instance?.isActive({ textAlign: 'center' }) ?? false,
      isAlignRight: instance?.isActive({ textAlign: 'right' }) ?? false,
      // Les mêmes boutons pilotent l'alignement du texte ET celui d'une image
      // sélectionnée ; il faut donc savoir laquelle des deux cibles est sous le curseur.
      isImage: instance?.isActive('image') ?? false,
      imageAlign: (instance?.getAttributes('image').align as string | null | undefined) ?? null,
    }),
  })

  if (!editor || !state) return null

  /*
   * L'alignement à gauche se déduit au lieu de se lire, dans les deux cas : ni un
   * paragraphe jamais aligné ni une image jamais alignée ne portent d'attribut, et
   * `isActive` y répond donc faux. Or en lecture de gauche à droite, l'absence
   * d'alignement *est* l'alignement à gauche — le bouton doit s'allumer dès qu'aucun
   * des deux autres n'est actif.
   */
  const isActiveAlignment: Record<Alignment, boolean> = state.isImage
    ? {
        left: state.imageAlign === null || state.imageAlign === 'left',
        center: state.imageAlign === 'center',
        right: state.imageAlign === 'right',
      }
    : {
        left: !state.isAlignCenter && !state.isAlignRight,
        center: state.isAlignCenter,
        right: state.isAlignRight,
      }

  /*
   * Une image sélectionnée reçoit son propre attribut `align` plutôt que le textAlign
   * du texte : les deux ne passent pas par le même mécanisme de rendu (voir la note
   * dans extensions.ts). Dans les deux cas, revenir à gauche efface l'attribut au lieu
   * d'en poser un, pour ne laisser aucun résidu dans le document.
   */
  const applyAlignment = (value: Alignment): void => {
    if (state.isImage) {
      editor
        .chain()
        .focus()
        .updateAttributes('image', { align: value === 'left' ? null : value })
        .run()
      return
    }

    if (value === 'left') {
      editor.chain().focus().unsetTextAlign().run()
      return
    }

    editor.chain().focus().setTextAlign(value).run()
  }

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

      {ALIGNMENTS.map(({ value, label }) => (
        <Button
          key={value}
          variant={ButtonVariant.Icon}
          title={label}
          className={isActiveAlignment[value] ? styles.active : ''}
          onClick={() => applyAlignment(value)}
        >
          <AlignIcon alignment={value} />
        </Button>
      ))}

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
