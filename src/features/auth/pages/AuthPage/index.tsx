import { AuthCard } from '../../components/AuthCard'
import styles from './AuthPage.module.css'

/*
 * Page d'accueil des visiteurs non connectés.
 * On garde volontairement très minimaliste : nom du produit + carte d'auth centrée.
 * On pourra enrichir plus tard avec un pitch marketing sous le fold.
 */
export const AuthPage = () => (
  <main className={styles.page}>
    <h1 className={styles.title}>yourgarden</h1>
    <AuthCard />
  </main>
)
