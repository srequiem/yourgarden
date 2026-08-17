'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/ui/Avatar'
import { Button, ButtonVariant } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatLongDate } from '@/lib/dates'

import { useIsOwner } from '../../hooks/useIsOwner'
import styles from './BlogHeader.module.css'

interface BlogHeaderProps {
  username: string
  displayName?: string
}

/*
 * Header du blog visité.
 * Après logout, on redirige explicitement vers la home — sinon on reste sur /{username}
 * qui est maintenant une page vide (le user courant ne matche plus l'owner).
 */
export const BlogHeader = ({ username, displayName }: BlogHeaderProps) => {
  const { user, logout } = useAuth()
  const isOwner = useIsOwner(username)
  const router = useRouter()

  const nameToShow = displayName ?? user?.name ?? username

  const onLogout = async (): Promise<void> => {
    await logout()
    router.push('/')
  }

  return (
    <header className={styles.header}>
      <Avatar name={nameToShow} />
      <div className={styles.identity}>
        <div className={styles.name}>{nameToShow}</div>
        <div className={styles.date}>{formatLongDate()}</div>
      </div>

      {isOwner && (
        <Button variant={ButtonVariant.Secondary} onClick={() => void onLogout()}>
          Déconnexion
        </Button>
      )}
    </header>
  )
}
