import styles from './Spacer.module.css'

/*
 * Espaceur de flex container, repris du primitive `Spacer` de TipTap UI.
 *
 * Sans prop : `flex: 1`, il avale tout l'espace restant et pousse ce qui le suit à l'autre
 * bout du conteneur (typiquement : garder le bouton image collé à droite de la toolbar).
 * Avec `size` : gouttière fixe de N pixels, non compressible.
 *
 * `aria-hidden` parce que c'est purement visuel : rien à annoncer à un lecteur d'écran.
 */

interface SpacerProps {
  /** Taille fixe en px. Omis = le spacer prend tout l'espace disponible. */
  size?: number
}

export const Spacer = ({ size }: SpacerProps) => (
  <span
    aria-hidden="true"
    className={styles.spacer}
    style={size === undefined ? undefined : { flex: `0 0 ${size}px` }}
  />
)
