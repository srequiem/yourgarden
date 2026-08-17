'use client'

import Link from 'next/link'

import { Tag } from '@/components/ui/Tag'
import { formatShortDate } from '@/lib/dates'

import type { Post } from '../../types'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: Post
  authorUsername: string
  /** Si vrai (mode owner), on affiche le badge de visibilité privé/public. */
  showVisibility?: boolean
}

/*
 * Card d'aperçu d'une publication.
 * Layout : cover (si présent) au-dessus, titre + excerpt + date dessous.
 * Sans cover, on affiche juste le texte — c'est très bien pour l'onglet Journal.
 *
 * Le titre affiché est le title du post s'il existe, sinon "Sans titre".
 * On ne veut pas laisser une card muette sur la grille.
 */

export const PostCard = ({ post, authorUsername, showVisibility = false }: PostCardProps) => {
  const href = `/${authorUsername}/p/${post.id}`
  const dateLabel = formatShortDate(new Date(post.updatedAt))
  const displayTitle = post.title.trim() || 'Sans titre'

  return (
    <Link href={href} className={styles.link}>
      <article className={styles.card}>
        {post.coverMediaPath && (
          // Image simple pour l'instant. Passera à next/image quand on aura de vraies URLs
          // (next/image nécessite de whitelister les domaines dans next.config).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverMediaPath} alt="" className={styles.cover} />
        )}

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.date}>{dateLabel}</span>
            {showVisibility && <Tag>{post.visibility === 'public' ? 'Public' : 'Privé'}</Tag>}
          </div>
          <h3 className={styles.title}>{displayTitle}</h3>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        </div>
      </article>
    </Link>
  )
}
