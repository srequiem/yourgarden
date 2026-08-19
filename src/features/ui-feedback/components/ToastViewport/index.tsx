'use client'

import { useToast } from '../../hooks/useToast'
import styles from './ToastViewport.module.css'

/*
 * Rend le toast courant. Conçu pour être placé DANS un conteneur en position relative
 * (typiquement juste sous la toolbar de l'éditeur) : le toast se positionne alors en absolute
 * par rapport à ce conteneur, pas par rapport à l'écran.
 *
 * Standard UI/UX : une erreur de validation d'action (upload refusé) s'affiche près de
 * l'action, pas au centre de l'écran. Le centre est réservé aux interruptions bloquantes.
 *
 * Rôle "alert" + aria-live assertive : les lecteurs d'écran annoncent l'erreur dès son
 * apparition. Une croix permet de fermer manuellement, en plus de l'auto-dismiss.
 */
export const ToastViewport = () => {
  const { toast, dismiss } = useToast()

  if (!toast) return null

  return (
    <div className={styles.anchor}>
      <div className={`${styles.toast} ${styles[toast.variant]}`} role="alert" aria-live="assertive">
        <span className={styles.message}>{toast.message}</span>
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}