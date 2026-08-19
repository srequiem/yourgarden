import styles from './AmbientBackdrop.module.css'

/*
 * Décor de fond de l'application : quelques halos colorés qui dérivent lentement,
 * recouverts d'un grain fin.
 *
 * Pourquoi ce composant existe : le glassmorphisme ne fonctionne que s'il y a quelque
 * chose *derrière* le verre. Un backdrop-filter posé sur un aplat uni ne produit rien —
 * flouter du beige uniforme redonne exactement le même beige. Ce sont ces halos qui,
 * en passant derrière les cards, font apparaître le verre : la couleur qui glisse sous
 * une surface translucide, c'est tout l'effet.
 *
 * Contrainte de palette : chaque halo est l'une des couleurs déjà définies dans
 * globals.css (accent cyan, vert olive, terracotta), simplement très diluée. Aucune
 * teinte nouvelle n'entre par cette porte.
 *
 * Server Component : ce n'est que du CSS, il n'a aucune raison de partir dans le bundle
 * client. `aria-hidden` parce qu'un lecteur d'écran n'a rien à faire d'un décor.
 */
export const AmbientBackdrop = () => (
  <div className={styles.backdrop} aria-hidden="true">
    <div className={`${styles.orb} ${styles.orbAccent}`} />
    <div className={`${styles.orb} ${styles.orbGreen}`} />
    <div className={`${styles.orb} ${styles.orbWarm}`} />
    <div className={`${styles.orb} ${styles.orbAccentLow}`} />
    <div className={styles.grain} />
  </div>
)
