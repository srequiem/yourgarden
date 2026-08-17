import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  elevated?: boolean
}

/*
 * Bloc conteneur générique : padding généreux, coins arrondis, ombre douce.
 * `elevated` bascule sur une ombre plus marquée pour les cards principales (auth, modals).
 */
export const Card = ({ children, elevated = false, className, ...rest }: CardProps) => (
  <section
    className={`${styles.card} ${elevated ? styles.elevated : ''} ${className ?? ''}`.trim()}
    {...rest}
  >
    {children}
  </section>
)
