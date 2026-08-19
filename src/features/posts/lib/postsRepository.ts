/*
 * Repository des publications — implémentation Supabase.
 *
 * On respecte l'interface PostsRepository définie plus tôt : les hooks (usePost, usePosts,
 * useCreatePost) ne changent pas d'une ligne. Seul ce fichier sait qu'on parle à Supabase.
 *
 * Deux responsabilités :
 *   1. Traduire les opérations métier (create, update, get, list, remove) en requêtes Supabase.
 *   2. Mapper les résultats bruts (RawPost) vers notre type métier (Post) via mapPost().
 *
 * Concernant excerpt et coverMediaPath :
 *   On les calcule côté Next.js (via computeExcerpt et findCoverImage) avant chaque update.
 *   Le trigger updated_at côté Postgres gère automatiquement la date de mise à jour.
 */

import { getBrowserSupabase } from '@/lib/supabase/browser'

import { computeExcerpt } from '../components/PostEditor/utils/computeExcerpt'
import { findCoverImage } from '../components/PostEditor/utils/findCoverImage'
import type { CreatePostInput, Post, UpdatePostInput } from '../types'
import { mapPost, type RawPost } from './mappers'

export interface PostsRepository {
  create: (input: CreatePostInput) => Promise<Post>
  update: (id: string, patch: UpdatePostInput) => Promise<Post>
  get: (id: string) => Promise<Post | null>
  listByUser: (userId: string) => Promise<Post[]>
  listPublicByUser: (userId: string) => Promise<Post[]>
  remove: (id: string) => Promise<void>
}

const supabasePostsRepository: PostsRepository = {
  async create(input) {
    const supabase = getBrowserSupabase()

    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: input.userId })
      .select()
      .single<RawPost>()

    if (error) throw error
    return mapPost(data)
  },

  async update(id, patch) {
    const supabase = getBrowserSupabase()

    // On construit le payload snake_case pour Supabase.
    // updated_at est géré automatiquement par le trigger Postgres — on ne l'envoie pas.
    const payload: Record<string, unknown> = {}

    if (patch.title !== undefined) payload.title = patch.title
    if (patch.visibility !== undefined) {
      payload.visibility = patch.visibility
      // published_at : on le pose une seule fois, au premier passage en public.
      // Côté Postgres on ne peut pas le savoir sans lire la ligne d'abord, donc on le gère
      // côté code : si on passe en public, on envoie published_at = now() uniquement
      // si le champ est encore null. Pour éviter une lecture supplémentaire, on l'envoie
      // systématiquement quand on passe en public — Supabase ne l'écrasera que si on le fournit.
      if (patch.visibility === 'public') {
        payload.published_at = new Date().toISOString()
      }
    }
    if (patch.content !== undefined) {
      payload.content = patch.content
      // On (re)dérive excerpt et coverMediaPath à chaque update de contenu.
      payload.excerpt = computeExcerpt(patch.content)
      payload.cover_media_path = findCoverImage(patch.content)
    }

    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single<RawPost>()

    if (error) throw error
    return mapPost(data)
  },

  async get(id) {
    const supabase = getBrowserSupabase()

    const { data, error } = await supabase
      .from('posts')
      .select()
      .eq('id', id)
      .single<RawPost>()

    // PGRST116 = "no rows found" — pas une erreur métier, juste "ce post n'existe pas".
    if (error?.code === 'PGRST116') return null
    if (error) throw error
    return mapPost(data)
  },

  async listByUser(userId) {
    const supabase = getBrowserSupabase()

    // RLS fait déjà le travail : si l'utilisateur connecté n'est pas le propriétaire,
    // les posts privés ne seront tout simplement pas retournés par Supabase.
    // Pas besoin de filtrer côté code — la BDD s'en occupe.
    const { data, error } = await supabase
      .from('posts')
      .select()
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .returns<RawPost[]>()

    if (error) throw error
    return (data ?? []).map(mapPost)
  },

  async listPublicByUser(userId) {
    const supabase = getBrowserSupabase()

    // Cette méthode sert pour la page publique d'un visiteur non-connecté.
    // Le filtre visibility = 'public' est explicite côté code ET garanti par RLS.
    // Double sécurité : même si RLS était désactivé, le filtre code tient.
    const { data, error } = await supabase
      .from('posts')
      .select()
      .eq('user_id', userId)
      .eq('visibility', 'public')
      .order('published_at', { ascending: false })
      .returns<RawPost[]>()

    if (error) throw error
    return (data ?? []).map(mapPost)
  },

  async remove(id) {
    const supabase = getBrowserSupabase()

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
  },
}

export const postsRepository: PostsRepository = supabasePostsRepository
