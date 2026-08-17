'use client'

import Link from 'next/link'

import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { formatShortDate, isSameDayOfYear } from '@/lib/dates'

import type { Post } from '../../types'
import styles from './OneYearAgoCard.module.css'

interface OneYearAgoCardProps {
  posts: Post[]
  authorUsername: string
}

/*
 * "Il y a un an aujourd'hui" — la card douce de rétention dont on avait parlé.
 *
 * On cherche dans les posts fournis en prop le premier post :
 *   - créé il y a au moins 350 jours
 *   - dont le jour de l'année (mois+jour) correspond à aujourd'hui
 *
 * Si on trouve, on affiche une card discrète en haut de la home. Sinon, on rend null.
 * Zéro coût cognitif quand il n'y a rien : l'utilisateur ne voit rien.
 *
 * Émotion pure, zéro mécanique toxique. C'est le hook de rétention que Locket exploite
 * (Rollcall hebdomadaire), version encore plus douce parce que juste annuelle.
 */

const DAYS_MS = 24 * 60 * 60 * 1000
const MIN_AGE_DAYS = 350

const findOneYearAgo = (posts: Post[]): Post | null => {
  const now = new Date()
  const nowMs = now.getTime()

  return (
    posts.find((post) => {
      const created = new Date(post.createdAt)
      const ageDays = (nowMs - created.getTime()) / DAYS_MS
      if (ageDays < MIN_AGE_DAYS) return false
      return isSameDayOfYear(created, now)
    }) ?? null
  )
}

export const OneYearAgoCard = ({ posts, authorUsername }: OneYearAgoCardProps) => {
  const memory = findOneYearAgo(posts)
  if (!memory) return null

  return (
    <Link href={`/${authorUsername}/p/${memory.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Tag>Il y a un an</Tag>
          <span className={styles.date}>{formatShortDate(new Date(memory.createdAt))}</span>
        </div>
        <div className={styles.title}>{memory.title.trim() || 'Sans titre'}</div>
        {memory.excerpt && <p className={styles.excerpt}>{memory.excerpt}</p>}
      </Card>
    </Link>
  )
}
