'use client'

import type { Editor } from '@tiptap/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { EditorToolbar } from '@/features/posts/components/EditorToolbar'
import { PostActionsMenu } from '@/features/posts/components/PostActionsMenu'
import { PostEditor } from '@/features/posts/components/PostEditor'
import { usePost } from '@/features/posts/hooks/usePost'
import { PostMode, usePostMode } from '@/features/posts/hooks/usePostMode'
import type { Post } from '@/features/posts/types'
import { ConfirmDialog } from '@/features/ui-feedback/components/ConfirmDialog'
import { ToastViewport } from '@/features/ui-feedback/components/ToastViewport'
import { formatLongDate } from '@/lib/dates'

import styles from './PostView.module.css'

/*
 * Affichage et édition d'une publication. Reçoit un post GARANTI non-null.
 *
 * Deux axes : isOwner (qui regarde) et mode read/edit (dans quel état le propriétaire
 * regarde son post). Un post s'ouvre en lecture — c'est un souvenir qu'on relit. L'édition
 * est explicite : double-clic dans le texte (desktop) ou bouton "Modifier". On en sort par
 * le bouton "Terminé" ou en quittant la page. Pas de clic-dehors : sortir d'un mode doit
 * être intentionnel, jamais l'effet de bord d'un autre geste.
 *
 * Header volontairement épuré :
 *   - Lecture : Retour + Modifier.
 *   - Édition : Retour + indicateur d'enregistrement discret + Terminé + menu ⋯.
 *   Les actions rares (visibilité) ou dangereuses (suppression) vivent dans le menu ⋯.
 *   La suppression ouvre une modale centrée (interruption franche pour une action destructrice).
 *
 * La date affichée est celle de CRÉATION (le moment du souvenir), discrète sous le titre —
 * pas updatedAt, qui n'est qu'une donnée technique sans valeur émotionnelle.
 */

interface PostViewProps {
  post: Post
  username: string
  isOwner: boolean
}

export const PostView = ({ post, username, isOwner }: PostViewProps) => {
  const router = useRouter()

  const {
    isSaving,
    saveTitle,
    saveContent,
    setVisibility,
    deletePost,
    isDeleting,
    deleteError,
  } = usePost(post.id)

  const { mode, enterEdit, exitToRead } = usePostMode(post.content)

  const [localTitle, setLocalTitle] = useState(post.title)
  const [editor, setEditor] = useState<Editor | null>(null)
  const onEditorReady = useCallback((instance: Editor) => setEditor(instance), [])

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isEditing = isOwner && mode === PostMode.Edit

  const onTitleChange = (value: string): void => {
    setLocalTitle(value)
    saveTitle(value)
  }

  const togglePublish = (): void => {
    void setVisibility(post.visibility === 'public' ? 'private' : 'public')
  }

  const confirmDelete = async (): Promise<void> => {
    await deletePost()
    router.replace(`/${username}`)
  }

  const onArticleDoubleClick = (): void => {
    if (isOwner && mode === PostMode.Read) enterEdit()
  }

  return (
    <article className={styles.article} onDoubleClick={onArticleDoubleClick}>
      <header className={styles.header}>
        <Link href={`/${username}`} className={styles.back}>
          ← Retour au blog
        </Link>

        <div className={styles.headerActions}>
          {isEditing ? (
            <>
              <span className={styles.saving} aria-live="polite">
                {isSaving ? 'Enregistrement…' : 'Enregistré'}
              </span>
              <Button variant={ButtonVariant.Primary} onClick={exitToRead}>
                Terminé
              </Button>
              <PostActionsMenu
                isPublic={post.visibility === 'public'}
                onToggleVisibility={togglePublish}
                onDelete={() => setIsDeleteOpen(true)}
              />
            </>
          ) : (
            isOwner && (
              <Button variant={ButtonVariant.Secondary} onClick={enterEdit}>
                Modifier
              </Button>
            )
          )}
        </div>
      </header>

      {isEditing && <EditorToolbar editor={editor} />}
      {isEditing && <ToastViewport />}

      {isEditing ? (
        <input
          type="text"
          className={styles.titleInput}
          placeholder="Titre de votre publication…"
          value={localTitle}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      ) : (
        <h1 className={styles.title}>{post.title.trim() || 'Sans titre'}</h1>
      )}

      {/* Date de création, discrète, sous le titre : le moment du souvenir. */}
      <time className={styles.date} dateTime={post.createdAt}>
        {formatLongDate(new Date(post.createdAt))}
      </time>

      <PostEditor
        content={post.content}
        editable={isEditing}
        onChange={saveContent}
        onReady={onEditorReady}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer cette publication ?"
        message="Cette action est définitive. La publication et son contenu seront perdus."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDanger
        isBusy={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {deleteError && (
        <span className={styles.error} role="alert">
          La suppression a échoué. Réessayez.
        </span>
      )}
    </article>
  )
}
