import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/*
 * Client Supabase pour les Server Components et Server Actions.
 *
 * Doit être appelé DANS le server component / action (pas au niveau module) parce que
 * `cookies()` de next/headers n'est disponible que pendant le rendu d'une requête.
 *
 * Les callbacks `getAll` / `setAll` permettent au client de lire les cookies de la requête
 * entrante et d'en écrire de nouveaux dans la réponse (pour le refresh de token).
 */

export const getServerSupabase = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // `set` peut échouer dans un Server Component (uniquement autorisé dans une Server Action
            // ou une Route Handler). Silencieux : le middleware s'occupera du refresh.
          }
        },
      },
    },
  )
}
