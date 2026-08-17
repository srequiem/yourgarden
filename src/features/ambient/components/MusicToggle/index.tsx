'use client'

import { useEffect, useState } from 'react'

import { Tag } from '@/components/ui/Tag'

import { useAmbientMusic } from '../../hooks/useAmbientMusic'
import styles from './MusicToggle.module.css'

/*
 * Petit FAB en bas à droite qui cycle les thèmes d'ambiance.
 * Le label du thème choisi apparaît 2,5s à côté après chaque changement, puis se cache tout seul.
 */
export const MusicToggle = () => {
  const { theme, next } = useAmbientMusic()
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    if (!showLabel) return
    const timer = setTimeout(() => setShowLabel(false), 2500)
    return () => clearTimeout(timer)
  }, [showLabel, theme])

  const onClick = (): void => {
    next()
    setShowLabel(true)
  }

  return (
    <div className={styles.container}>
      {showLabel && <Tag className={styles.label}>{theme}</Tag>}
      <button
        type="button"
        title="Changer l'ambiance sonore"
        onClick={onClick}
        className={styles.button}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </button>
    </div>
  )
}
