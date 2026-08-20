'use client'

import { useEffect, useRef, useState } from 'react'

import styles from './PostActionsMenu.module.css'

/*
 * Menu déroulant "⋯" pour les actions rares d'un post (rendre public/privé, supprimer).
 *
 * Ces actions n'ont pas leur place en permanence dans le header : elles sont peu fréquentes
 * (une fois par post) ou dangereuses (suppression). Les regrouper derrière un ⋯ garde le
 * header épuré tout en les laissant accessibles en un geste.
 *
 * Se ferme au clic extérieur et à Échap. Chaque action ferme le menu avant de s'exécuter.
 */

interface PostActionsMenuProps {
  isPublic: boolean
  onToggleVisibility: () => void
  onDelete: () => void
}

export const PostActionsMenu = ({
  isPublic,
  onToggleVisibility,
  onDelete,
}: PostActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent): void => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  const runAction = (action: () => void): void => {
    setIsOpen(false)
    action()
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Plus d'actions"
      >
        ⋯
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            className={styles.item}
            role="menuitem"
            onClick={() => runAction(onToggleVisibility)}
          >
            {isPublic ? 'Rendre privé' : 'Rendre public'}
          </button>
          <button
            type="button"
            className={`${styles.item} ${styles.danger}`}
            role="menuitem"
            onClick={() => runAction(onDelete)}
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
