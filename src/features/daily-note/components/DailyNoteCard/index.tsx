'use client'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { Tag } from '@/components/ui/Tag'
import { formatDayName } from '@/lib/dates'

import { useDailyNote } from '../../hooks/useDailyNote'
import styles from './DailyNoteCard.module.css'

/*
 * Card "Carnet du jour" affichée dans l'aside du blog.
 * Petit espace de saisie libre, écrasé à chaque frappe, avec auto-save silencieux.
 *
 * C'est la seule surface *vivante* de la page — tout le reste est de la consultation.
 * Elle est donc traitée un cran au-dessus des autres cards : verre légèrement teinté
 * d'accent, pastille de date en tête, et deux points lumineux qui pulsent pour dire
 * "on est aujourd'hui, et ça s'enregistre tout seul". L'auto-save existait déjà mais
 * ne se voyait pas : une ligne de texte statique ne prouve rien, un point qui bat si.
 */
export const DailyNoteCard = () => {
  const { note, save, clear, wordCount } = useDailyNote()

  const isEmpty = note.text.trim() === ''

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            Carnet du jour
          </span>
          {/* Accord au singulier : "1 mots" sur une card qu'on regarde tous les jours, ça pique. */}
          <Tag>
            {wordCount} {wordCount > 1 ? 'mots' : 'mot'}
          </Tag>
        </div>
        <h2 className={styles.title}>{formatDayName()}</h2>
      </div>

      <Textarea
        className={styles.input}
        value={note.text}
        onChange={(event) => save(event.target.value)}
        placeholder="Notez librement votre journée : idées, humeurs, choses à retenir…"
      />

      <div className={styles.footer}>
        <span className={styles.autosave}>
          <span className={styles.dot} aria-hidden="true" />
          Enregistrement automatique
        </span>
        {/*
         * Désactivé tant qu'il n'y a rien à effacer : proposer une action qui ne fera
         * rien est un faux bouton, et sur une card aussi minimale ça se remarque.
         */}
        <Button variant={ButtonVariant.Clean} onClick={clear} disabled={isEmpty}>
          Effacer
        </Button>
      </div>
    </Card>
  )
}
