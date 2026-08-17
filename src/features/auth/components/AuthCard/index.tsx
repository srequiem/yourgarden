'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

import { useAuth } from '../../hooks/useAuth'
import { AuthMode } from '../../types'
import styles from './AuthCard.module.css'

/*
 * Formulaire de connexion / inscription.
 *
 * Repris quasi tel quel de l'ancienne AuthCard, avec deux différences :
 * - `useNavigate` (react-router) → `useRouter` de next/navigation
 * - la redirection après login/register va vers la page publique du user connecté (/{username})
 *   plutôt qu'un dashboard générique, conformément à la décision "modèle fusionné" qu'on a prise.
 *
 * NB : cette version reste une UI mockée. Aucun mot de passe n'est vérifié.
 * L'inscription se fait avec email + password (validation min 8 caractères côté HTML), et le
 * champ Nom apparaît uniquement en mode Register. Le username n'est pas demandé pour l'instant —
 * on le dérivera automatiquement de l'email dans useAuth. Il sera ajouté ici quand Supabase arrivera.
 */

export const AuthCard = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.Login)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { authenticate } = useAuth()
  const router = useRouter()

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const nextUser = await authenticate(mode, { name: name || undefined, email, password })
    router.push(`/${nextUser.username}`)
  }

  return (
    <Card elevated className={styles.card}>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
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

        {mode === AuthMode.Register && (
          <Input
            placeholder="Votre nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        <Button variant={ButtonVariant.Primary} type="submit" className={styles.submit}>
          {mode === AuthMode.Login ? 'Se connecter' : 'Créer mon jardin'}
        </Button>
      </form>
    </Card>
  )
}
