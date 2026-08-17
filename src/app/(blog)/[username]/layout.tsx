'use client'

import { use, type ReactNode } from 'react'

import { MusicToggle } from '@/features/ambient/components/MusicToggle'
import { BlogHeader } from '@/features/blog/components/BlogHeader'

import styles from './layout.module.css'

/*
 * Layout partagé par toutes les pages sous /{username}/* .
 * Pas d'onglets : à ce stade, une publication est une publication. Si un jour on introduit
 * une vraie distinction typée (visuel vs long form), on remettra un composant Tabs ici.
 */

interface BlogLayoutProps {
  children: ReactNode
  params: Promise<{ username: string }>
}

const BlogLayout = ({ children, params }: BlogLayoutProps) => {
  const { username } = use(params)

  return (
    <main className={styles.page}>
      <BlogHeader username={username} />
      {children}
      <MusicToggle />
    </main>
  )
}

export default BlogLayout
