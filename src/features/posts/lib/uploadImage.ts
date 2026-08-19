import { getBrowserSupabase } from '@/lib/supabase/browser'

/*
 * Upload d'une image vers Supabase Storage (bucket post-images).
 *
 * Convention de chemin : {userId}/{uuid}.{extension}
 * Chaque user a son propre dossier, ce qui correspond à la policy RLS
 * qu'on a posée ("foldername(name)[1] = auth.uid()").
 *
 * Retourne l'URL publique de l'image uploadée — c'est cette URL qui sera
 * insérée dans le bloc image TipTap et stockée dans le JSONContent en base.
 *
 * Limites volontaires :
 *   - Taille max 5 MB (raisonnable pour un blog perso, évite les abus).
 *   - Types acceptés : JPEG, PNG, WebP, GIF.
 *   - Pas de compression côté client pour l'instant. On pourra ajouter un
 *     resize canvas + conversion WebP plus tard si le storage grossit.
 */

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const getExtension = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] ?? 'jpg'
}

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image trop lourde (5 MB maximum).')
  }

  const supabase = getBrowserSupabase()
  const extension = getExtension(file.type)
  const fileName = `${userId}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file, {
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
