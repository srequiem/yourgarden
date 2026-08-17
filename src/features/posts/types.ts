/*
 * Types du domaine "posts".
 *
 * Choix de modélisation clef : `content` est un JSONContent (format TipTap / ProseMirror).
 * On ne stocke JAMAIS de HTML brut. C'est ce qui permet :
 *   - un stockage léger (le doc pèse quelques Ko même avec 30 photos, les fichiers vivent ailleurs),
 *   - un rendu contrôlé (React côté web, extraction texte pour la recherche, etc.),
 *   - une évolution facile (ajouter un bloc "audio" pour tes morceaux = un `type` de plus).
 *
 * Convention Sacha : unions strictes pour tous les enum-like fields (kind, visibility),
 * jamais de string générique. Quand on branchera Supabase, on aura une forme RawPost snake_case
 * séparée + un mapper — cf. la leçon WTTJ sur le typage.
 *
 * NB : à ce stade, une publication est une publication — pas de distinction Portfolio/Journal.
 * Si un jour on veut réintroduire une vraie séparation (ex: Portfolio = grille visuelle style
 * Instagram, Journal = long form), on rajoutera un champ `kind` à ce moment-là. Pour l'instant
 * on garde le modèle simple.
 */

import type { JSONContent } from '@tiptap/core'

export type Visibility = 'private' | 'public'

export interface Post {
  id: string
  userId: string
  title: string
  content: JSONContent
  excerpt: string
  coverMediaPath: string | null
  visibility: Visibility
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface CreatePostInput {
  userId: string
}

export interface UpdatePostInput {
  title?: string
  content?: JSONContent
  visibility?: Visibility
}
