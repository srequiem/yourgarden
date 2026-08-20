'use client'

import { useEffect } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { createPortal } from 'react-dom'

import styles from './ConfirmDialog.module.css'

/*
 * Modale de confirmation centrée, pour les actions destructrices ou engageantes.
 *
 * Volontairement une interruption franche : overlay sombre + panneau au centre. C'est le
 * standard pour une action dangereuse (suppression) — on force l'utilisateur à s'arrêter
 * et confirmer, plutôt que de glisser des boutons dans l'interface existante.
 *
 * Accessibilité : fermeture à la touche Échap, clic sur l'overlay = annuler, focus visuel
 * clair sur les deux issues. role="dialog" + aria-modal pour les lecteurs d'écran.
 *
 * Contrôlé par le parent via `isOpen`. Ne rend rien si fermé.
 */

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  isDanger?: boolean
  isBusy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDanger = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  // Fermeture à la touche Échap.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.title}>{title}</div>
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.actions}>
          <Button variant={ButtonVariant.Ghost} onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? ButtonVariant.Danger : ButtonVariant.Primary}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? '…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
