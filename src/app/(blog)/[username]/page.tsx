'use client'

import { use } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { AddButton } from '@/features/blog/components/AddButton'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'
import { DailyNoteCard } from '@/features/daily-note/components/DailyNoteCard'
import { OneYearAgoCard } from '@/features/posts/components/OneYearAgoCard'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { usePosts } from '@/features/posts/hooks/usePosts'
import type { Post } from '@/features/posts/types'

import styles from './page.module.css'

/*
 * Page unique du blog : /{username}
 *
 * Étapes :
 *   1. Résoudre le username de l'URL vers le profil de SON propriétaire (useProfile).
 *      C'est indispensable : la page part d'un username, mais charger les posts nécessite
 *      l'id du propriétaire — qui n'a rien à voir avec l'utilisateur connecté.
 *   2. Charger les posts de ce propriétaire (usePosts avec profile.id).
 *   3. Filtrer selon qui regarde : le propriétaire voit tout, un visiteur voit le public.
 *
 * RLS fait la vraie sécurité côté BDD : même si le filtre client laissait passer un post
 * privé, Supabase ne le renverrait pas à un visiteur non-propriétaire.
 */

const filterVisiblePosts = (posts: Post[], isOwner: boolean): Post[] =>
  isOwner ? posts : posts.filter((post) => post.visibility === 'public')

interface BlogPageProps {
  params: Promise<{ username: string }>
}

const BlogPage = ({ params }: BlogPageProps) => {
  const { username } = use(params)
  const isOwner = useIsOwner(username)

  const { data: profile, isLoading: isProfileLoading } = useProfile(username)

  // On charge les posts du PROPRIÉTAIRE du blog (profile.id), pas de l'utilisateur connecté.
  const { data: allPosts } = usePosts(profile?.id ?? null)

  const posts = filterVisiblePosts(allPosts ?? [], isOwner)

  // Profil en cours de résolution : on évite d'afficher un faux "rien de public".
  if (isProfileLoading) {
    return <div className={styles.state}>Chargement…</div>
  }

  // Username qui n'existe pas en base.
  if (!profile) {
    return <div className={styles.state}>Ce blog n&apos;existe pas.</div>
  }

  return (
    <>
      <div className={styles.layout}>
        <section className={styles.main}>
          <OneYearAgoCard posts={posts} authorUsername={username} />
          <PostGrid
            posts={posts}
            authorUsername={username}
            showVisibility={isOwner}
            emptyMessage={
              isOwner
                ? 'Rien encore. Ajoutez votre première publication avec le bouton +.'
                : "Ce blog n'a encore rien de public."
            }
          />
        </section>
        {isOwner && (
          <aside className={styles.aside}>
            <DailyNoteCard />
          </aside>
        )}
      </div>
      {isOwner && <AddButton />}
    </>
  )
}

export default BlogPage
