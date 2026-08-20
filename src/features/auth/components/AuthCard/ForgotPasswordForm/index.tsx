'use client'

import { useState, type FormEvent } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import { useAuth } from '../../../hooks/useAuth'
import { formatAuthError } from '../utils/formatAuthError'
import styles from './ForgotPasswordForm.module.css'

/*
 * Formulaire de demande de réinitialisation : un seul champ email.
 *
 * Sécurité : on n'indique jamais si l'email correspond à un compte existant. Après envoi,
 * on affiche systématiquement un message neutre "si un compte existe, un email est parti".
 * C'est le standard — révéler l'existence d'un compte est une fuite d'information.
 *
 * En cas de vraie erreur technique (réseau, rate limit), on l'affiche via formatAuthError.
 *
 * onBack : permet de revenir au formulaire de connexion (le lien "Retour" en bas).
 */

interface ForgotPasswordFormProps {
  onBack: () => void
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const { requestPasswordReset } = useAuth()

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await requestPasswordReset({ email })
      setIsSent(true)
    } catch (thrown) {
      setError(formatAuthError(thrown))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className={styles.success}>
        <div className={styles.successTitle}>C&apos;est envoyé</div>
        <p className={styles.successText}>
          Si un compte existe avec <strong>{email}</strong>, vous allez recevoir un email avec un
          lien pour choisir un nouveau mot de passe.
        </p>
        <Button variant={ButtonVariant.Ghost} onClick={onBack} className={styles.back}>
          Retour à la connexion
        </Button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
      <p className={styles.intro}>
        Entrez votre email : on vous enverra un lien pour réinitialiser votre mot de passe.
      </p>

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button
        variant={ButtonVariant.Primary}
        type="submit"
        className={styles.submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '…' : 'Envoyer le lien'}
      </Button>

      <Button variant={ButtonVariant.Ghost} onClick={onBack} className={styles.back}>
        Retour à la connexion
      </Button>
    </form>
  )
}
