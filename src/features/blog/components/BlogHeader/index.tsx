'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/ui/Avatar'
import { Button, ButtonVariant } from '@/components/ui/Button'
import { Tooltip } from '@/features/ui-feedback/components/Tooltip'

import { formatLongDate } from '@/lib/dates'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useIsOwner } from '../../hooks/useIsOwner'

import styles from './BlogHeader.module.css'

interface BlogHeaderProps {
  username: string
  displayName?: string
}

/*
 * Header du blog visité — présent sur toutes les pages sous /{username}.
 *
 * Le nom affiché est celui du PROPRIÉTAIRE du blog visité (displayName, résolu par le layout
 * via useProfile). En absence (chargement), fallback discret sur le username de l'URL.
 *
 * L'identité (avatar + nom) est cliquable et renvoie TOUJOURS vers le blog du visiteur
 * connecté (/{user.username}) — c'est le geste "revenir chez moi" classique. Si personne
 * n'est connecté, l'identité n'est pas un lien.
 *
 * Après logout, redirection explicite vers la home.
 */
export const BlogHeader = ({ username, displayName }: BlogHeaderProps) => {
  const { user, logout } = useAuth()
  const isOwner = useIsOwner(username)
  const router = useRouter()

  // Nom du propriétaire du blog visité (pas du visiteur).
  const nameToShow = displayName ?? username

  const onLogout = async (): Promise<void> => {
    await logout()
    router.push('/')
  }

  const identity = (
    <>
      <Avatar name={nameToShow} />
      <span className={styles.name}>{nameToShow}</span>
    </>
  )

  // L'identité n'est un lien que si on visite le blog d'un AUTRE : le geste "revenir chez moi"
  // n'a de sens que là. Sur son propre blog, isOwner est vrai → affichage statique, pas de lien.
  const isVisitingOther = Boolean(user) && !isOwner

  return (
    <header className={styles.header}>
      {isVisitingOther && user ? (
        <Tooltip label="Revenir à mon blog">
          <Link href={`/${user.username}`} className={styles.identity}>
            {identity}
          </Link>
        </Tooltip>
      ) : (
        <div className={styles.identity}>{identity}</div>
      )}

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
