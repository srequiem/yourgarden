'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'

import { AuthMode } from '../../types'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './AuthCard.module.css'

/*
 * Orchestre : bascule entre LoginForm et RegisterForm via un toggle inline.
 *
 * Volontairement mince : pas de state de champs ici, pas de logique de soumission,
 * juste le mode courant. Chaque sous-formulaire gère sa propre vie (champs, erreurs,
 * soumission, succès).
 */

export const AuthCard = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.Login)

  return (
    <Card elevated className={styles.card}>
      <div className={styles.modeToggle}>
        {[AuthMode.Login, AuthMode.Register].map((candidate) => {
          const isActive = mode === candidate
          const label = candidate === AuthMode.Login ? 'Connexion' : 'Inscription'
          return (
            <button
              key={candidate}
              type="button"
              onClick={() => setMode(candidate)}
              className={`${styles.modeButton} ${isActive ? styles.modeButtonActive : ''}`.trim()}
            >
              {label}
            </button>
          )
        })}
      </div>

      {mode === AuthMode.Login ? <LoginForm /> : <RegisterForm />}
    </Card>
  )
}