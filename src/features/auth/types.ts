/*
 * Types du domaine auth.
 *
 * Register : name + username + email + password
 *   Le username détermine l'URL du blog (/{username}).
 *   Modifiable plus tard avec redirect auto + réserve 90 jours (cf. mémoire).
 *
 * Login : email + password uniquement, pour rester simple.
 *   On pourra ajouter le login par username plus tard si besoin — le username est en base,
 *   il suffira d'une server action qui résout username → email avant l'appel Supabase.
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

export interface RegisterCredentials {
  name: string
  username: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordUpdate {
  password: string
}
