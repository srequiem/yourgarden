import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Tag.module.css'

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

/*
 * Petite pastille de métadonnée : nombre de mots, statut de visibilité, "il y a 1 an", etc.
 * Volontairement discret : fond vert doux, texte petit.
 */
export const Tag = ({ children, className, ...rest }: TagProps) => (
  <span className={`${styles.tag} ${className ?? ''}`.trim()} {...rest}>
    {children}
  </span>
)
