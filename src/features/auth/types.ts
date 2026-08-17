/*
 * Types du domaine auth.
 *
 * Différence importante vs la version précédente : on ajoute `username`.
 * On en a besoin parce que l'URL de chaque blog dépend directement de ce champ
 * (tonblog.com/{username}). Pour le MVP mock, on le dérive de l'email
 * (partie avant l'arobase). Quand Supabase arrivera, on stockera un vrai username
 * choisi à l'inscription, avec la logique de modification + redirect 301 décidée
 * (voir MIGRATION.md et l'échange qu'on a eu sur username_history).
 */

export enum AuthMode {
  Login = 'login',
  Register = 'register',
}

export interface User {
  id: string
  username: string
  name: string
  email: string
}

export interface AuthCredentials {
  name?: string
  email: string
  password: string
}
