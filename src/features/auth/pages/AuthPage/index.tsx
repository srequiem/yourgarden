import { AuthCard } from '../../components/AuthCard'
import { CursorCloud } from '../../components/CursorCloud'
import styles from './AuthPage.module.css'

/*
 * Page d'accueil des visiteurs non connectés.
 * On garde volontairement très minimaliste : nom du produit + carte d'auth centrée.
 * On pourra enrichir plus tard avec un pitch marketing sous le fold.
 *
 * <CursorCloud /> ne rend qu'un canvas décoratif en fond, réservé à cette page : c'est
 * le premier écran du produit, le seul où l'on peut se permettre un effet gratuit.
 */
export const AuthPage = () => (
  <main className={styles.page}>
    <CursorCloud />
    <h1 className={styles.title}>yourgarden</h1>
    <AuthCard />
  </main>
)
