import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

/*
 * Middleware racine Next.js — s'exécute avant chaque requête matchée.
 *
 * Rôle : refresh silencieux de la session Supabase à chaque navigation.
 *
 * Le matcher exclut les assets statiques et les images pour éviter d'exécuter le middleware
 * inutilement (économise du temps et évite des logs pollués).
 */

export const middleware = (request: NextRequest) => {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (fichiers statiques)
     * - _next/image (images optimisées)
     * - favicon.ico, favicon.svg
     * - fichiers d'assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
