'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import { useAuth } from '../../../hooks/useAuth'
import { formatAuthError } from '../utils/formatAuthError'
import styles from './LoginForm.module.css'

/*
 * Formulaire de connexion : email + password.
 *
 * En cas de succès, redirige vers /{username} du user connecté (modèle fusionné).
 * En cas d'erreur, affiche un message humain traduit via formatAuthError.
 */

interface LoginFormProps {
  onForgotPassword: () => void
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const user = await login({ email, password })
      router.push(`/${user.username}`)
    } catch (thrown) {
      setError(formatAuthError(thrown))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        autoComplete="current-password"
      />
      <Input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        autoComplete="current-password"
      />

      <button type="button" className={styles.forgotLink} onClick={onForgotPassword}>
        Mot de passe oublié ?
      </button>

      {error && <div className={styles.error}>{error}</div>}

      <Button
        variant={ButtonVariant.Primary}
        type="submit"
        className={styles.submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '…' : 'Se connecter'}
      </Button>
    </form>
  )
}
