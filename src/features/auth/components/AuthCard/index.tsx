'use client'

import { useState } from 'react'

import { Card } from '@/components/ui/Card'

import { AuthMode } from '../../types'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './AuthCard.module.css'

/*
 * Orchestre les trois écrans d'authentification :
 *   - Connexion (LoginForm)
 *   - Inscription (RegisterForm)
 *   - Mot de passe oublié (ForgotPasswordForm)
 *
 * Le toggle ne gère que Login/Register (les deux modes "permanents"). Le mot de passe
 * oublié est un écran temporaire accessible depuis la connexion via un lien, et non un
 * troisième onglet — d'où l'état `showForgot` séparé de `mode`. Revenir en arrière
 * (onBack) réaffiche simplement la connexion.
 */

export const AuthCard = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.Login)
  const [showForgot, setShowForgot] = useState(false)

  // Écran mot de passe oublié : on masque le toggle pour ne pas distraire.
  if (showForgot) {
    return (
      <Card elevated className={styles.card}>
        <ForgotPasswordForm onBack={() => setShowForgot(false)} />
      </Card>
    )
  }

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

      {mode === AuthMode.Login ? (
        <LoginForm onForgotPassword={() => setShowForgot(true)} />
      ) : (
        <RegisterForm />
      )}
    </Card>
  )
}
