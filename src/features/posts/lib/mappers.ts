import type { JSONContent } from '@tiptap/core'

import type { Post, Visibility } from '../types'

/*
 * Mapper entre la forme brute retournée par Supabase (snake_case, types Postgres)
 * et notre type métier Post (camelCase, TypeScript strict).
 *
 * Convention Sacha appliquée : toujours un type RawX séparé + une fonction mapX().
 * Ça isole les détails de la BDD du reste du code. Si on renomme une colonne en base,
 * on ne modifie que ce fichier — les hooks et composants ne bougent pas.
 */

export interface RawPost {
  id: string
  user_id: string
  title: string
  content: JSONContent
  excerpt: string
  cover_media_path: string | null
  visibility: Visibility
  created_at: string
  updated_at: string
  published_at: string | null
}

export const mapPost = (raw: RawPost): Post => ({
  id: raw.id,
  userId: raw.user_id,
  title: raw.title,
  content: raw.content,
  excerpt: raw.excerpt,
  coverMediaPath: raw.cover_media_path,
  visibility: raw.visibility,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  publishedAt: raw.published_at,
})
