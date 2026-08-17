import { NextResponse, type NextRequest } from 'next/server'

import { getServerSupabase } from '@/lib/supabase/server'

/*
 * Route Handler qui traite le retour depuis un email de confirmation Supabase.
 *
 * Flow :
 *   1. L'utilisateur clique un lien de confirmation dans son email.
 *   2. Supabase le renvoie vers /auth/callback?code=... (paramètre PKCE).
 *   3. Ce handler échange le code contre une session (cookies posés).
 *   4. On redirige vers la home, qui va détecter la session côté serveur et amener
 *      l'utilisateur sur son blog.
 *
 * NB : c'est LE bon endroit pour faire l'échange de code. Le faire côté client
 * (dans app/page.tsx) est fragile parce que le SDK peut ne pas être chargé quand le
 * code arrive dans l'URL. Côté serveur, tout est propre et déterministe.
 */

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await getServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Si pas de code ou échange raté, on renvoie vers la home avec un flag d'erreur
  // (le formulaire pourra l'afficher plus tard si tu veux — pour l'instant on ignore).
  return NextResponse.redirect(`${origin}/?auth_error=1`)
}
