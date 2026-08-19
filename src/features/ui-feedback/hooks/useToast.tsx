'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/*
 * Système de toast minimaliste, partagé dans toute l'app.
 *
 * Un seul toast à la fois (le dernier écrase le précédent) — suffisant pour un feedback
 * d'erreur ponctuel, on ne fait pas une file d'attente. Chaque toast se dissout tout seul
 * après un délai, ou immédiatement si on en déclenche un nouveau.
 *
 * Volontairement découplé de l'upload : n'importe quel composant peut appeler
 * showToast(...) via le hook. Aujourd'hui c'est l'upload d'image, demain ce sera
 * autre chose (échec de sauvegarde, etc.).
 */

export type ToastVariant = 'error' | 'success'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: Toast | null
  showToast: (message: string, variant?: ToastVariant) => void
  dismiss: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 90000

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null)

  const dismiss = useCallback((): void => setToast(null), [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'error'): void => {
      const id = Date.now()
      setToast({ id, message, variant })

      // Auto-dismiss : on ne referme que si c'est toujours CE toast qui est affiché
      // (un toast plus récent ne doit pas être fermé par le timer d'un ancien).
      window.setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current))
      }, AUTO_DISMISS_MS)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toast, showToast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
