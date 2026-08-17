'use client'

import { useCallback, useEffect, useState } from 'react'

import { todayKey } from '@/lib/dates'
import { readJson, writeJson } from '@/lib/storage'

import type { DailyNote } from '../types'

/*
 * Hook de la "note du jour" : un texte libre écrasé à chaque frappe, keyed par date.
 *
 * Contrairement aux posts, la note du jour n'a pas d'historique visible dans le produit :
 * chaque jour a une clé propre et on affiche uniquement celle d'aujourd'hui.
 * (Si on veut plus tard revoir les anciennes, la donnée est là — il suffit d'ajouter une vue.)
 *
 * Adaptation SSR : lecture dans un useEffect au lieu du useState initializer, sinon crash.
 */

const keyFor = (date: string): string => `yourgarden.note.${date}`

const emptyNote = (date: string): DailyNote => ({
  date,
  text: '',
  updatedAt: new Date().toISOString(),
})

export const useDailyNote = (date: string = todayKey()) => {
  const [note, setNote] = useState<DailyNote>(() => emptyNote(date))

  useEffect(() => {
    const stored = readJson<DailyNote>(keyFor(date))
    if (stored) setNote(stored)
  }, [date])

  const save = useCallback(
    (text: string): void => {
      const next: DailyNote = { date, text, updatedAt: new Date().toISOString() }
      writeJson(keyFor(date), next)
      setNote(next)
    },
    [date],
  )

  const clear = useCallback((): void => save(''), [save])

  const wordCount = note.text.trim() === '' ? 0 : note.text.trim().split(/\s+/).length

  return { note, save, clear, wordCount }
}
