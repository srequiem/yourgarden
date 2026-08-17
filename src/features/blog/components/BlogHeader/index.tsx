'use client'

import { Avatar } from '@/components/ui/Avatar'
import { Button, ButtonVariant } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatLongDate } from '@/lib/dates'

import { useIsOwner } from '../../hooks/useIsOwner'
import styles from './BlogHeader.module.css'

interface BlogHeaderProps {
  /** Username tiré de l'URL. C'est LUI qui identifie le blog visité, pas le user connecté. */
  username: string
  /** Nom d'affichage du propriétaire (à récupérer via un futur endpoint public). */
  displayName?: string
}

/*
 * Header du blog visité.
 * Affiche l'avatar + nom du propriétaire à gauche, la date à droite, et un bouton
 * "Déconnexion" uniquement si l'utilisateur connecté est le propriétaire du blog.
 *
 * Le displayName est un prop parce que quand un visiteur regarde /vanessa, l'utilisateur
 * connecté (nous) n'a AUCUNE info sur Vanessa — il faudra un endpoint public qui renvoie
 * le nom associé à un username. Pour l'instant en MVP mock, on utilise le user connecté
 * comme fallback (voir la page qui passe le prop).
 */

export const BlogHeader = ({ username, displayName }: BlogHeaderProps) => {
  const { user, logout } = useAuth()
  const isOwner = useIsOwner(username)

  const nameToShow = displayName ?? user?.name ?? username

  return (
    <header className={styles.header}>
      <Avatar name={nameToShow} />
      <div className={styles.identity}>
        <div className={styles.name}>{nameToShow}</div>
        <div className={styles.date}>{formatLongDate()}</div>
      </div>

      {isOwner && (
        <Button variant={ButtonVariant.Secondary} onClick={logout}>
          Déconnexion
        </Button>
      )}
    </header>
  )
}
