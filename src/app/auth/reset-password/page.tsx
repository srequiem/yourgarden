'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatAuthError } from '@/features/auth/components/AuthCard/utils/formatAuthError'

import styles from './page.module.css'

/*
 * Page de définition d'un nouveau mot de passe, atteinte via le lien de l'email de reset.
 *
 * À l'arrivée, Supabase a déjà ouvert une session temporaire (le SDK consomme le token
 * présent dans l'URL). On attend donc que `isReady` soit true ET qu'un `user` existe :
 *   - user présent  → session de reset valide, on affiche le formulaire.
 *   - pas de user    → lien invalide ou expiré, on affiche un message + retour à l'accueil.
 *
 * Après mise à jour réussie, l'utilisateur est connecté avec son nouveau mot de passe.
 * On le redirige vers son blog (/{username}).
 *
 * Deux champs (mot de passe + confirmation) pour éviter les fautes de frappe — standard UX
 * pour un changement de mot de passe. On vérifie la correspondance côté client avant l'appel.
 */

const ResetPasswordPage = () => {
  const { user, isReady, updatePassword } = useAuth()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sécurité d'affichage : si le chargement est fini et qu'aucune session n'existe,
  // c'est que le lien est invalide/expiré.
  const isInvalidLink = isReady && !user

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword({ password })
      // Session déjà active → on envoie l'utilisateur sur son blog.
      if (user) {
        router.push(`/${user.username}`)
      } else {
        router.push('/')
      }
    } catch (thrown) {
      setError(formatAuthError(thrown))
    } finally {
      setIsSubmitting(false)
    }
  }

  // On ne rend rien tant que Supabase n'a pas répondu (évite un flash de formulaire).
  if (!isReady) {
    return <main className={styles.page} />
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>yourgarden</h1>

      <Card elevated className={styles.card}>
        {isInvalidLink ? (
          <div className={styles.invalid}>
            <div className={styles.invalidTitle}>Lien invalide ou expiré</div>
            <p className={styles.invalidText}>
              Ce lien de réinitialisation n&apos;est plus valide. Refaites une demande depuis la
              page de connexion.
            </p>
            <Button variant={ButtonVariant.Ghost} onClick={() => router.push('/')}>
              Retour à l&apos;accueil
            </Button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
            <p className={styles.intro}>Choisissez un nouveau mot de passe.</p>

            <Input
              type="password"
              placeholder="Nouveau mot de passe (8 caractères min)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Confirmez le mot de passe"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
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
              {isSubmitting ? '…' : 'Mettre à jour'}
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}

export default ResetPasswordPage
