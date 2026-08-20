'use client'

import { use } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'
import { usePost } from '@/features/posts/hooks/usePost'

import { PostView } from './PostView/index'
import styles from './page.module.css'

/*
 * Page d'une publication — rôle de GARDIEN uniquement.
 *
 * Elle ne fait que : charger le post, gérer les états transitoires (chargement, introuvable,
 * accès refusé), puis déléguer tout l'affichage à PostView.
 *
 * Intérêt de ce découpage : PostView ne reçoit QUE des posts garantis non-null. Ça supprime
 * le problème d'initialisation asynchrone du mode read/edit — quand PostView est monté, le
 * contenu du post existe déjà, donc usePostMode s'initialise correctement du premier coup
 * (post vide → édition, post rempli → lecture). Pas de key hack, pas de useEffect correctif.
 *
 * C'est la séparation page = orchestration / composant = présentation, appliquée à la lettre.
 */

interface PostPageProps {
  params: Promise<{ username: string; postId: string }>
}

const PostPage = ({ params }: PostPageProps) => {
  const { username, postId } = use(params)
  const { user } = useAuth()
  const isOwner = useIsOwner(username)

  const { post, isLoading } = usePost(postId)

  if (isLoading) {
    return <div className={styles.state}>Chargement…</div>
  }

  if (!post) {
    return <div className={styles.state}>Publication introuvable.</div>
  }

  // Garde-fou visibilité : un visiteur ne doit pas voir un post privé.
  // On masque complètement (indistinguable d'un vrai 404). La vraie barrière est RLS côté BDD.
  const isReallyOwner = isOwner && user?.id === post.userId
  if (post.visibility === 'private' && !isReallyOwner) {
    return <div className={styles.state}>Publication introuvable.</div>
  }

  // À partir d'ici, `post` est garanti non-null et lisible par cet utilisateur.
  return <PostView post={post} username={username} isOwner={isReallyOwner} />
}

export default PostPage
