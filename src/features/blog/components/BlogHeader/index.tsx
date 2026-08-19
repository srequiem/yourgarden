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
 * Header du blog visité — présent sur toutes les pages sous /{username}.
 *
 * Trois zones : identité collée à gauche, date du jour au centre exact de la largeur,
 * déconnexion à droite. Le <header> ne porte aucune matière, ce sont les blocs qui en
 * ont ; le décor de fond passe entre eux.
 *
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
      <div className={styles.identity}>
        <Avatar name={nameToShow} />
        <span className={styles.name}>{nameToShow}</span>
      </div>

      <time className={styles.today}>{formatLongDate()}</time>

      {isOwner && (
        <Button
          variant={ButtonVariant.Secondary}
          className={styles.logout}
          onClick={() => void onLogout()}
        >
          Déconnexion
        </Button>
      )}
    </header>
  )
}
