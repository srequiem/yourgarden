'use client'

import { useRouter } from 'next/navigation'
import { use, useEffect, type ReactNode } from 'react'

// import { MusicToggle } from '@/features/ambient/components/MusicToggle'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { BlogHeader } from '@/features/blog/components/BlogHeader'
import { useIsOwner } from '@/features/blog/hooks/useIsOwner'

import styles from './layout.module.css'

/*
 * Layout partagé par toutes les pages sous /{username}/*.
 *
 * Rôle de gatekeeper + résolution du profil du propriétaire du blog visité.
 *
 * IMPORTANT : la garde ne redirige QUE si l'utilisateur n'est ni connecté ni propriétaire.
 * Un utilisateur connecté a le droit de visiter le blog d'un autre (pour voir ses posts
 * publics), donc on ne le renvoie pas. On laisse la page /{username} gérer le cas "profil
 * inexistant".
 *
 * On résout le profil du propriétaire (via le username de l'URL) pour afficher SON nom
 * dans le header, pas celui du visiteur connecté.
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

  const { data: profile } = useProfile(username)

  // On ne redirige que le visiteur NON connecté qui n'est pas le propriétaire.
  // Un utilisateur connecté peut voir le blog de quelqu'un d'autre.
  const shouldRedirect = isReady && !user && !isOwner

  useEffect(() => {
    if (shouldRedirect) router.replace('/')
  }, [shouldRedirect, router])

  if (!isReady || shouldRedirect) return null

  return (
    <main className={styles.page}>
      <BlogHeader username={username} displayName={profile?.name} />
      {children}
      {/* <MusicToggle /> */}
    </main>
  )
}

export default BlogLayout
