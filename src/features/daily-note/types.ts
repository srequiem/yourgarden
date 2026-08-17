/*
 * Note du jour : bloc de texte libre, écrasé à chaque frappe, keyed par date ISO.
 * C'est différent d'un "post" — c'est un pense-bête éphémère qu'on retrouve chaque jour,
 * sans historique par défaut. Complète le Portfolio et le Journal des posts.
 */

export interface DailyNote {
  /** yyyy-mm-dd */
  date: string
  text: string
  updatedAt: string
}
