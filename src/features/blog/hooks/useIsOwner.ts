'use client'

import { useAuth } from '@/features/auth/hooks/useAuth'

/*
 * Le hook central du "modèle fusionné" qu'on a décidé ensemble :
 * une seule page /{username} pour le blog, deux états selon qui la visite.
 *
 *   isOwner === true  → mode édition (bouton "Ajouter" visible, badges de visibilité, éditeur actif)
 *   isOwner === false → mode lecture (posts privés invisibles, aucun contrôle d'édition)
 *
 * MVP mock : simple comparaison de string entre le user connecté et l'username de l'URL.
 * En prod Supabase, la source de vérité reste ce hook côté UI, mais la vraie sécurité
 * viendra des règles Row Level Security qui empêchent la lecture d'un post privé
 * qui ne t'appartient pas, même si tu bypasses l'UI.
 */

export const useIsOwner = (username: string): boolean => {
  const { user } = useAuth()
  return user?.username === username
}
