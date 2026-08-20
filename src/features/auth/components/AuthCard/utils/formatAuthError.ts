/*
 * Traduit les erreurs Supabase Auth en messages courts, en français, adressés à l'utilisateur.
 *
 * Stratégie à deux niveaux :
 *   1. On lit d'abord le `code` de l'erreur (ex: 'same_password', 'weak_password').
 *      C'est la source la PLUS fiable : Supabase expose des codes stables qui ne changent
 *      pas d'une version à l'autre ni selon la langue. À privilégier systématiquement.
 *   2. Fallback sur le parsing du `message` texte pour les cas où le code est absent
 *      (certaines erreurs anciennes ou côté Postgres n'ont pas de code normalisé).
 *
 * Cas non couverts : message générique plutôt que le texte brut, pour ne pas exposer de
 * détails techniques à l'utilisateur. Pour debugger, logguer l'erreur en amont de l'appel.
 *
 * Référence des codes : https://supabase.com/docs/reference/javascript/auth-error-codes
 */

interface SupabaseAuthError {
  message: string
  code?: string
}

const isAuthError = (value: unknown): value is SupabaseAuthError =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof (value as { message: unknown }).message === 'string'

/*
 * Table de correspondance code Supabase → message français.
 * On la garde exhaustive sur les codes qu'on peut réellement rencontrer dans nos flux
 * (login, register, reset password, update password).
 */
const MESSAGES_BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email ou mot de passe incorrect.',
  email_not_confirmed: "Confirmez votre email d'abord (regardez votre boîte mail).",
  user_already_exists: 'Un compte existe déjà avec cet email.',
  email_exists: 'Un compte existe déjà avec cet email.',
  same_password: "Le nouveau mot de passe doit être différent de l'ancien.",
  weak_password: 'Mot de passe trop faible : au moins 8 caractères.',
  over_email_send_rate_limit: 'Trop de demandes. Attendez quelques minutes avant de réessayer.',
  over_request_rate_limit: 'Trop de tentatives. Attendez quelques minutes.',
  validation_failed: 'Certains champs sont invalides. Vérifiez votre saisie.',
  session_not_found: 'Votre session a expiré. Refaites une demande.',
  same_email: "Le nouvel email doit être différent de l'actuel.",
}

export const formatAuthError = (thrown: unknown): string => {
  if (!isAuthError(thrown)) return "Une erreur inattendue s'est produite."

  // 1. Priorité au code (stable, fiable).
  if (thrown.code && MESSAGES_BY_CODE[thrown.code]) {
    return MESSAGES_BY_CODE[thrown.code]
  }

  // 2. Fallback : parsing du message texte, pour les erreurs sans code normalisé
  //    (notamment les erreurs remontées depuis les contraintes Postgres).
  const raw = thrown.message.toLowerCase()

  if (raw.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.'
  }
  if (raw.includes('email not confirmed')) {
    return "Confirmez votre email d'abord (regardez votre boîte mail)."
  }
  if (raw.includes('user already registered')) {
    return 'Un compte existe déjà avec cet email.'
  }
  if (raw.includes('duplicate key') && raw.includes('username')) {
    return "Ce nom d'utilisateur est déjà pris."
  }
  if (raw.includes('password should be at least')) {
    return 'Le mot de passe doit faire au moins 8 caractères.'
  }
  if (raw.includes('different from the old password')) {
    return "Le nouveau mot de passe doit être différent de l'ancien."
  }
  if (raw.includes('rate limit')) {
    return 'Trop de tentatives. Attendez quelques minutes.'
  }

  return "Une erreur s'est produite. Réessayez."
}
