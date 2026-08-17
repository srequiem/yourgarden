'use client'

import { useCreatePost } from '@/features/posts/hooks/useCreatePost'

import styles from './AddButton.module.css'

/*
 * Bouton flottant "Ajouter" — visible uniquement en mode owner (voir usage dans les pages).
 *
 * Volontairement discret : petit rond en bas à droite, avec juste un "+".
 * Pas de gros CTA agressif au centre de l'écran — on avait décidé que la création devait être
 * *disponible* mais pas *demandée*, pour éviter de recréer une pression à la Instagram.
 *
 * Comportement : crée un post vide du bon kind (portfolio ou journal) et redirige immédiatement
 * vers l'éditeur (voir useCreatePost). Zéro friction, comme Notion.
 */

/*
 * Bouton flottant "Ajouter" — visible uniquement en mode owner.
 * Volontairement discret, en bas à gauche. Crée un post vide et redirige immédiatement
 * vers l'éditeur (voir useCreatePost). Zéro friction, comme Notion.
 */

export const AddButton = () => {
  const { create, isPending } = useCreatePost()

  return (
    <button
      type="button"
      className={styles.button}
      title="Ajouter une publication"
      disabled={isPending}
      onClick={() => create()}
    >
      +
    </button>
  )
}
