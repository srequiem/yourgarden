'use client'

import { useRouter } from 'next/navigation'
import { use, useEffect, type ReactNode } from 'react'

// import { MusicToggle } from '@/features/ambient/components/MusicToggle'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { BlogHeader } from '@/features/blog/components/BlogHeader'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'

import styles from './layout.module.css'

/*
 * Layout partagé par toutes les pages sous /{username}/*.
 *
 * Rôle de gatekeeper : décide si on affiche le blog ou si on redirige.
 *
 * Trois états possibles :
 *   1. Auth pas encore chargée (isReady === false) → on ne rend RIEN. C'est ce qui
 *      empêche le flash "on voit le header d'un blog qui n'existe pas".
 *      Une fois qu'on aura un vrai lookup public d'utilisateur (étape "posts"), on
 *      pourra remplacer le rien par un skeleton, mais pour l'instant le rien vaut mieux
 *      qu'un mauvais rendu.
 *
 *   2. Auth chargée, pas connecté ET pas le propriétaire → on redirige vers /.
 *      Ce cas couvre : URL bookmarked, deconnexion depuis autre onglet, essai d'accès
 *      à /vanessa quand vanessa n'existe pas encore, etc.
 *
 *   3. Auth chargée ET propriétaire → on rend normalement.
 *
 * NB Next 15 : params est une Promise, on unwrap avec use() de React 19.
 * (On restera 'use client' tant que l'auth est côté client. Quand on passera à un
 * lookup public d'user, cette route pourra devenir server component avec une garde
 * bien plus propre.)
 */

interface BlogLayoutProps {
  children: ReactNode
  params: Promise<{ username: string }>
}

const BlogLayout = ({ children, params }: BlogLayoutProps) => {
  const { username } = use(params)
  const { isReady, user } = useAuth()
  const isOwner = useIsOwner(username)
  const router = useRouter()

  const shouldRedirect = isReady && !user && !isOwner

  useEffect(() => {
    if (shouldRedirect) router.replace('/')
  }, [shouldRedirect, router])

  // Cas 1 & 2 : on ne rend rien pour éviter le flash.
  //   - isReady === false : on ne sait pas encore.
  //   - shouldRedirect === true : on est en train de partir, inutile de rendre le blog.
  if (!isReady || shouldRedirect) return null

  return (
    <main className={styles.page}>
      <BlogHeader username={username} />
      {children}
      {/* <MusicToggle /> */}
    </main>
  )
}

export default BlogLayout
