'use client'

import type { Editor } from '@tiptap/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useState } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'
import { EditorToolbar } from '@/features/posts/components/EditorToolbar'
import { PostEditor } from '@/features/posts/components/PostEditor'
import { usePost } from '@/features/posts/hooks/usePost'
import { formatLongDate } from '@/lib/dates'

import { ToastViewport } from '@/features/ui-feedback/components/ToastViewport'

import styles from './page.module.css'

/*
 * Page d'une publication (éditeur ou lecture, selon le mode).
 *
 * Fonctionnement :
 *   - Un seul composant PostEditor rendu, avec `editable` piloté par isOwner.
 *   - Le titre est un <input> quand owner, un <h1> quand visiteur.
 *   - Autosave silencieuse via usePost (debounce 1500 ms). L'indicateur "Enregistrement…"
 *     apparaît discrètement à côté du bouton Publier.
 *   - Bouton Publier / Rendre privé : bascule visibility, appel immédiat sans debounce.
 *   - Bouton Supprimer : confirmation en deux temps DANS la barre (pas de window.confirm,
 *     qui casserait le design system avec une popup native), puis redirection vers le blog.
 *
 * Garde-fou visibilité privée :
 *   Si le post est privé et que l'utilisateur n'est pas le propriétaire, on affiche un
 *   message "publication introuvable" (comme si le post n'existait pas). C'est UI-only —
 *   la vraie sécurité viendra des règles RLS Supabase.
 *
 * Attention TipTap : on passe le `content` initial une seule fois (au mount de l'éditeur).
 * Si on veut naviguer entre plusieurs posts sans démonter, il faudrait passer une `key={postId}`
 * au PostEditor. Comme ici la page entière est démontée entre deux postId (navigation Next),
 * ce n'est pas nécessaire.
 */

interface PostPageProps {
  params: Promise<{ username: string; postId: string }>
}

const PostPage = ({ params }: PostPageProps) => {
  const { username, postId } = use(params)
  const { user } = useAuth()
  const isOwner = useIsOwner(username)
  const router = useRouter()

  const {
    post,
    isLoading,
    isSaving,
    saveTitle,
    saveContent,
    setVisibility,
    deletePost,
    isDeleting,
    deleteError,
  } = usePost(postId)

  // On synchronise localement le titre pour un rendu immédiat pendant la frappe.
  // (usePost renvoie le post persisté ; on ne veut pas attendre l'autosave pour voir le nouveau texte.)
  const [localTitle, setLocalTitle] = useState('')
  useEffect(() => {
    if (post) setLocalTitle(post.title)
  }, [post])

  // Instance TipTap exposée par PostEditor via son onReady. On la garde en state pour
  // pouvoir la passer à la Toolbar (qui a besoin de l'editor pour appliquer les commandes).
  const [editor, setEditor] = useState<Editor | null>(null)
  const onEditorReady = useCallback((instance: Editor) => setEditor(instance), [])

  // Confirmation de suppression en deux temps, gérée en local : le premier clic arme,
  // le second exécute. Pas de state global à trimballer, et l'état retombe tout seul
  // si l'utilisateur quitte la page.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  if (isLoading) {
    return <div className={styles.state}>Chargement…</div>
  }

  // AVANT le test `!post` : une fois la suppression réussie, le post est déjà sorti du cache
  // et on afficherait sinon "Publication introuvable" le temps que la redirection parte.
  if (isDeleting) {
    return <div className={styles.state}>Suppression…</div>
  }

  if (!post) {
    return <div className={styles.state}>Publication introuvable.</div>
  }

  // Garde-fou visibilité : un visiteur ne doit pas voir un post privé.
  // On ne vérifie que si on est SÛR que l'utilisateur n'est pas l'auteur (donc après isReady).
  const isReallyOwner = isOwner && user?.id === post.userId
  if (post.visibility === 'private' && !isReallyOwner) {
    return <div className={styles.state}>Publication introuvable.</div>
  }

  const onTitleChange = (value: string): void => {
    setLocalTitle(value)
    saveTitle(value)
  }

  const togglePublish = async (): Promise<void> => {
    await setVisibility(post.visibility === 'public' ? 'private' : 'public')
  }

  const confirmDelete = async (): Promise<void> => {
    await deletePost()
    // `replace` et pas `push` : l'URL du post supprimé ne doit pas rester dans l'historique,
    // sinon le bouton Retour du navigateur y ramène et affiche "Publication introuvable".
    router.replace(`/${username}`)
  }

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <Link href={`/${username}`} className={styles.back}>
          ← Retour au blog
        </Link>
        <span className={styles.date}>{formatLongDate(new Date(post.updatedAt))}</span>

        {isReallyOwner && (
          <>
            {isSaving ? (
              <span className={styles.saving}>Enregistrement…</span>
            ) : (
              <Tag>Enregistré</Tag>
            )}
            <Button variant={ButtonVariant.Primary} onClick={() => void togglePublish()}>
              {post.visibility === 'public' ? 'Rendre privé' : 'Rendre public'}
            </Button>

            {isConfirmingDelete ? (
              <>
                <span className={styles.confirm}>Supprimer définitivement&nbsp;?</span>
                <Button variant={ButtonVariant.Ghost} onClick={() => setIsConfirmingDelete(false)}>
                  Annuler
                </Button>
                <Button variant={ButtonVariant.Danger} onClick={() => void confirmDelete()}>
                  Oui, supprimer
                </Button>
              </>
            ) : (
              <Button variant={ButtonVariant.Delete} onClick={() => setIsConfirmingDelete(true)}>
                Supprimer
              </Button>
            )}

            {deleteError && (
              <span className={styles.error} role="alert">
                La suppression a échoué. Réessayez.
              </span>
            )}
          </>
        )}
      </header>

      {isReallyOwner && <EditorToolbar editor={editor} />}
      {isReallyOwner && <ToastViewport />}

      {isReallyOwner ? (
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

      <PostEditor
        content={post.content}
        editable={isReallyOwner}
        onChange={saveContent}
        onReady={onEditorReady}
      />
    </article>
  )
}

export default PostPage
