import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
}

/*
 * Avatar circulaire avec l'initiale du nom.
 * Version minimaliste sans image pour l'instant : le premier caractère du nom, en majuscule,
 * sur un fond vert doux. Quand on branchera Supabase Storage on ajoutera un `avatarUrl` optionnel.
 */
export const Avatar = ({ name }: AvatarProps) => (
  <div className={styles.avatar}>{name.charAt(0).toUpperCase() || '?'}</div>
)
