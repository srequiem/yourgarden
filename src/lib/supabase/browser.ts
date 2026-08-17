'use client'

import { createBrowserClient } from '@supabase/ssr'

/*
 * Client Supabase pour le navigateur.
 *
 * À utiliser dans tous les composants 'use client' (hooks, event handlers, etc.).
 * Lit la session depuis les cookies du navigateur automatiquement.
 *
 * IMPORTANT : ne pas créer plusieurs instances. On instancie une fois via un module singleton
 * pour éviter les problèmes de multiple GoTrueClient (avertissement Supabase classique).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const getBrowserSupabase = (): SupabaseClient => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return client
}
