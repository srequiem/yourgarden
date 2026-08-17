'use client'

import { useState, type FormEvent } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import { useAuth } from '../../../hooks/useAuth'
import { formatAuthError } from '../utils/formatAuthError'
import styles from './RegisterForm.module.css'

/*
 * Formulaire d'inscription : name + username + email + password.
 *
 * Comportement particulier : après un register réussi, on n'affiche PAS un router.push()
 * mais un message de confirmation demandant à l'utilisateur d'aller cliquer le lien
 * de confirmation reçu par email. C'est le paramètre "Confirm email" activé dans Supabase :
 * tant que l'utilisateur n'a pas cliqué, la session n'est pas créée.
 *
 * Une fois qu'il cliquera le lien de confirmation, Supabase le redirigera vers Site URL
 * (http://localhost:3000 en dev) avec une session active — il atterrira donc sur la home
 * qui le redirigera automatiquement vers son blog.
 *
 * Validation username : pattern 3-32 chars, [a-zA-Z0-9_-], strictement identique à la
 * contrainte CHECK côté base. Double barrière : HTML + BDD.
 */

const USERNAME_PATTERN = '[a-zA-Z0-9_-]{3,32}'

export const RegisterForm = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const { register } = useAuth()

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({ name, username, email, password })
      setSuccessEmail(email)
    } catch (thrown) {
      setError(formatAuthError(thrown))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successEmail) {
    return (
      <div className={styles.success}>
        <div className={styles.successTitle}>Presque !</div>
        <p className={styles.successText}>
          On vient de vous envoyer un email à <strong>{successEmail}</strong>. Cliquez sur le
          lien pour activer votre compte, puis revenez ici pour vous connecter.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
      <Input
        placeholder="Votre nom"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        autoComplete="name"
      />
      <Input
        placeholder="Nom d'utilisateur (l'URL de votre blog)"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        pattern={USERNAME_PATTERN}
        title="3 à 32 caractères. Lettres, chiffres, _ ou -"
        autoComplete="username"
      />
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
        placeholder="Mot de passe (8 caractères min)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button
        variant={ButtonVariant.Primary}
        type="submit"
        className={styles.submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '…' : 'Créer mon jardin'}
      </Button>
    </form>
  )
}
