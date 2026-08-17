/*
 * Repository des publications.
 *
 * On isole toute la persistance derrière une interface `PostsRepository`. L'implémentation
 * actuelle est localStorage-only (MVP mock). Quand on branchera Supabase, on créera un
 * `supabasePostsRepository` qui satisfait la même interface, et on remplacera l'export
 * final sans toucher aux hooks ni aux composants. C'est le seul endroit du code qui
 * "sait" comment les posts sont stockés.
 *
 * Convention de clé localStorage : `yourgarden.post.{id}` pour un post, et on liste tous
 * les posts d'un user en scannant les clés avec le préfixe puis en filtrant sur `userId`.
 * C'est correct pour un MVP à faible volume (quelques dizaines de posts). Pour scaler on
 * passera à Postgres.
 */

import { listKeys, readJson, removeKey, writeJson } from '@/lib/storage'

import { createEmptyDoc } from '../components/PostEditor/utils/createEmptyDoc'
import { computeExcerpt } from '../components/PostEditor/utils/computeExcerpt'
import { findCoverImage } from '../components/PostEditor/utils/findCoverImage'
import type { CreatePostInput, Post, UpdatePostInput } from '../types'

const KEY_PREFIX = 'yourgarden.post.'
const keyFor = (id: string): string => `${KEY_PREFIX}${id}`

export interface PostsRepository {
  create: (input: CreatePostInput) => Promise<Post>
  update: (id: string, patch: UpdatePostInput) => Promise<Post>
  get: (id: string) => Promise<Post | null>
  listByUser: (userId: string) => Promise<Post[]>
  remove: (id: string) => Promise<void>
}

const nowIso = (): string => new Date().toISOString()

const applyDerivedFields = (post: Post): Post => ({
  ...post,
  excerpt: computeExcerpt(post.content),
  coverMediaPath: findCoverImage(post.content),
})

const localStoragePostsRepository: PostsRepository = {
  async create(input) {
    const id = crypto.randomUUID()
    const now = nowIso()
    const post: Post = {
      id,
      userId: input.userId,
      title: '',
      content: createEmptyDoc(),
      excerpt: '',
      coverMediaPath: null,
      visibility: 'private',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    }
    writeJson(keyFor(id), post)
    return post
  },

  async update(id, patch) {
    const existing = readJson<Post>(keyFor(id))
    if (!existing) throw new Error(`Post ${id} introuvable`)

    const merged: Post = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    }
    const next = patch.content !== undefined ? applyDerivedFields(merged) : merged

    if (patch.visibility === 'public' && !existing.publishedAt) {
      next.publishedAt = nowIso()
    }

    writeJson(keyFor(id), next)
    return next
  },

  async get(id) {
    return readJson<Post>(keyFor(id))
  },

  async listByUser(userId) {
    const posts = listKeys(KEY_PREFIX)
      .map((key) => readJson<Post>(key))
      .filter((post): post is Post => post !== null && post.userId === userId)

    return posts.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  },

  async remove(id) {
    removeKey(keyFor(id))
  },
}

export const postsRepository: PostsRepository = localStoragePostsRepository
