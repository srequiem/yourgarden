'use client'

import { PostCard } from '../PostCard'
import type { Post } from '../../types'
import styles from './PostGrid.module.css'

interface PostGridProps {
  posts: Post[]
  authorUsername: string
  showVisibility?: boolean
  /** Message affiché quand la liste est vide. */
  emptyMessage?: string
}

/*
 * Grille de cards responsive.
 *
 * - Mobile-first : 1 colonne par défaut.
 * - >=640px : 2 colonnes.
 * - >=960px : 3 colonnes.
 *
 * On garde une grille régulière plutôt qu'un vrai masonry pour rester simple et lisible.
 * Si on veut vraiment du masonry Pinterest-style plus tard, on pourra utiliser
 * `column-count` CSS (support limité pour les items interactifs) ou une lib dédiée.
 */

export const PostGrid = ({
  posts,
  authorUsername,
  showVisibility,
  emptyMessage,
}: PostGridProps) => {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyMessage ?? 'Rien pour le moment. Ajoutez votre première publication.'}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          authorUsername={authorUsername}
          showVisibility={showVisibility}
        />
      ))}
    </div>
  )
}
