/*
 * Traduit les erreurs Supabase Auth en messages courts, en français, adressés à l'utilisateur.
 *
 * Les erreurs Supabase natives sont techniques et en anglais ("Invalid login credentials",
 * "User already registered", etc.). Ce mapper les rend humaines.
 *
 * Cas non couverts : on renvoie un message générique plutôt que le message brut, pour ne
 * pas exposer des détails techniques à l'utilisateur final. Si tu veux debugger, log l'erreur
 * en amont de l'appel.
 */

interface WithMessage {
  message: string
}

const hasMessage = (value: unknown): value is WithMessage =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof (value as { message: unknown }).message === 'string'

export const formatAuthError = (thrown: unknown): string => {
  if (!hasMessage(thrown)) return "Une erreur inattendue s'est produite."

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
  if (raw.includes('rate limit')) {
    return 'Trop de tentatives. Attendez quelques minutes.'
  }

  return "Une erreur s'est produite. Réessayez."
}
