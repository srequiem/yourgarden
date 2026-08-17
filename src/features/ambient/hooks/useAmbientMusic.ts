'use client'

import { useCallback, useEffect, useState } from 'react'

import { readJson, writeJson } from '@/lib/storage'

import { AmbientTheme } from '../types'

const THEMES: readonly AmbientTheme[] = [
  AmbientTheme.Acoustic,
  AmbientTheme.Piano,
  AmbientTheme.Waves,
  AmbientTheme.Jazz,
  AmbientTheme.None,
]

const STORAGE_KEY = 'yourgarden.ambient'

const isValidTheme = (value: unknown): value is AmbientTheme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)

export const useAmbientMusic = () => {
  const [theme, setTheme] = useState<AmbientTheme>(AmbientTheme.Acoustic)

  useEffect(() => {
    const stored = readJson<AmbientTheme>(STORAGE_KEY)
    if (isValidTheme(stored)) setTheme(stored)
  }, [])

  const next = useCallback((): void => {
    setTheme((current) => {
      const index = (THEMES.indexOf(current) + 1) % THEMES.length
      const value = THEMES[index] ?? AmbientTheme.None
      writeJson(STORAGE_KEY, value)
      return value
    })
  }, [])

  return { theme, next }
}
