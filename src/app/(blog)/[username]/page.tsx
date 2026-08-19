'use client'

import { use } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'
import { usePosts } from '@/features/posts/hooks/usePosts'
import type { Post } from '@/features/posts/types'

import { AddButton } from '@/features/blog/components/AddButton'
import { DailyNoteCard } from '@/features/daily-note/components/DailyNoteCard'
import { OneYearAgoCard } from '@/features/posts/components/OneYearAgoCard'
import { PostGrid } from '@/features/posts/components/PostGrid'

import styles from './page.module.css'

/*
 * Page unique du blog : /{username}
 *
 * Ancienne architecture : deux onglets (Portfolio + Journal) qui étaient en fait le même
 * produit sous deux noms. Simplifié en une seule page qui liste toutes les publications.
 *
 * Layout à 2 colonnes en desktop :
 *   - Colonne principale : "il y a un an" + grille de posts
 *   - Aside droite (owner uniquement) : DailyNoteCard (pense-bête du jour)
 * En mobile, tout empile — la DailyNoteCard passe en premier (accès rapide au pense-bête).
 *
 * Modèle fusionné maintenu :
 *   - Owner : voit tous ses posts (privés + publics), avec badge visibility et AddButton.
 *   - Visiteur : ne voit que les posts publics, pas d'AddButton, pas de DailyNoteCard.
 */

const filterVisiblePosts = (posts: Post[], isOwner: boolean): Post[] =>
  isOwner ? posts : posts.filter((post) => post.visibility === 'public')

interface BlogPageProps {
  params: Promise<{ username: string }>
}

const BlogPage = ({ params }: BlogPageProps) => {
  const { username } = use(params)
  const { user } = useAuth()
  const isOwner = useIsOwner(username)

  const authorId = isOwner ? (user?.id ?? null) : null
  const { data: allPosts } = usePosts(authorId)

  const posts = filterVisiblePosts(allPosts ?? [], isOwner)

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
