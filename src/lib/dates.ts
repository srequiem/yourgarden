/*
 * Helpers de formatage de dates. Toutes les sorties sont en français (fr-FR).
 * Repris de ton ancien src/lib/dates.ts, avec ajout de :
 *   - formatShortDate : pour les cards de publication (ex: "12 juin")
 *   - isSameDayOfYear : pour la card "il y a un an aujourd'hui"
 */

const capitalize = (value: string): string =>
  value.replace(/^./, (character) => character.toUpperCase())

export const todayKey = (): string => new Date().toISOString().slice(0, 10)

export const formatLongDate = (date: Date = new Date()): string =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date),
  )

export const formatDayName = (date: Date = new Date()): string =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date),
  )

export const formatShortDate = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)

/**
 * Renvoie vrai si les deux dates tombent le même jour de l'année (peu importe l'année).
 * Sert à la fonctionnalité "il y a un an aujourd'hui".
 */
export const isSameDayOfYear = (a: Date, b: Date): boolean =>
  a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
