import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/*
 * Helper appelé par le middleware racine (voir src/middleware.ts) à chaque navigation.
 *
 * Rôle : rafraîchir automatiquement le token de session (qui expire au bout d'une heure)
 * en lisant les cookies de la requête et en réécrivant les cookies mis à jour dans la réponse.
 *
 * Sans ce middleware, la session expirerait silencieusement au bout d'une heure et l'utilisateur
 * se retrouverait déconnecté au prochain refresh.
 */

export const updateSession = async (request: NextRequest): Promise<NextResponse> => {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // L'appel à getUser() déclenche le refresh du token si nécessaire — c'est LE point clé
  // qui fait vivre la session. Sans cet appel, le middleware ne sert à rien.
  await supabase.auth.getUser()

  return response
}
