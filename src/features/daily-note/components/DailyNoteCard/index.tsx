'use client'

import { Button, ButtonVariant } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { Tag } from '@/components/ui/Tag'
import { formatDayName } from '@/lib/dates'

import { useDailyNote } from '../../hooks/useDailyNote'
import styles from './DailyNoteCard.module.css'

/*
 * Card "Carnet du jour" affichée dans l'aside de l'onglet Journal.
 * Petit espace de saisie libre, écrasé à chaque frappe, avec auto-save silencieux.
 */
export const DailyNoteCard = () => {
  const { note, save, clear, wordCount } = useDailyNote()

  return (
    <Card>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Carnet du jour</div>
          <h2 className={styles.title}>{formatDayName()}</h2>
        </div>
        <Tag>{wordCount} mots</Tag>
      </div>

      <Textarea
        value={note.text}
        onChange={(event) => save(event.target.value)}
        placeholder="Notez librement votre journée : idées, humeurs, choses à retenir…"
      />

      <div className={styles.footer}>
        <span>Enregistrement automatique</span>
        <Button variant={ButtonVariant.Ghost} onClick={clear}>
          Effacer
        </Button>
      </div>
    </Card>
  )
}
