/*
 * Helpers de sérialisation JSON dans localStorage.
 *
 * Différence importante vs la version Vite : ici on doit se protéger du SSR de Next.
 * Les composants "use client" sont rendus une première fois côté serveur pour produire le HTML initial,
 * moment où `window` et `localStorage` n'existent pas. Les fonctions ci-dessous no-op côté serveur
 * plutôt que de crasher, et les hooks (useAuth, useDailyNote, etc.) déclenchent la vraie lecture
 * dans un useEffect — jamais dans un initializer de useState.
 */

const isBrowser = (): boolean => typeof window !== 'undefined'

export const readJson = <T>(key: string): T | null => {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const writeJson = <T>(key: string, value: T): void => {
  if (!isBrowser()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const removeKey = (key: string): void => {
  if (!isBrowser()) return
  window.localStorage.removeItem(key)
}

export const listKeys = (prefix: string): string[] => {
  if (!isBrowser()) return []

  const keys: string[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key && key.startsWith(prefix)) keys.push(key)
  }
  return keys
}
