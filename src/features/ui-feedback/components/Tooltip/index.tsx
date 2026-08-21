'use client'

import { useState, type ReactNode } from 'react'

import styles from './Tooltip.module.css'

/*
 * Tooltip maison, dans la DA verre du site — remplace le title HTML natif (gris système,
 * hors charte). S'affiche au survol et au focus clavier (accessibilité).
 *
 * Volontairement simple : wrappe un élément, positionne une bulle au-dessus. Pas de gestion
 * de collision de bord pour l'instant (suffisant pour nos usages : header, toolbar, menu).
 * Si un jour on en a besoin près des bords, on ajoutera un placement dynamique.
 */

interface TooltipProps {
  label: string
  children: ReactNode
}

export const Tooltip = ({ label, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  const show = (): void => setIsVisible(true)
  const hide = (): void => setIsVisible(false)

  return (
    <span
      className={styles.wrapper}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <span className={styles.bubble} role="tooltip">
          {label}
        </span>
      )}
    </span>
  )
}
