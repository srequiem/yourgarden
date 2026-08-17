'use client'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'

import { Button, ButtonVariant } from '@/components/ui/Button'

import styles from './ColorHighlightPopover.module.css'

/*
 * Équivalent du ColorHighlightPopover de TipTap UI, réécrit aux conventions du projet.
 *
 * Pourquoi ne pas copier le composant officiel : le kit TipTap UI s'installe façon shadcn
 * (`npx @tiptap/cli add color-highlight-popover`) et embarque ses propres primitives —
 * Radix Popover, ses SCSS, son système de tokens. Ici tout est en CSS Modules sur les tokens
 * `--color-*` de globals.css, avec notre propre `Button`. On garde donc le comportement
 * (déclencheur + palette + retrait de la surbrillance) et on jette la plomberie.
 *
 * La marque utilisée est `@tiptap/extension-highlight` en mode multicolor, la vraie
 * extension officielle : le document reste 100 % standard TipTap.
 */

interface HighlightColor {
  label: string
  /** Hex en dur : cette valeur est persistée dans le JSONContent du post. */
  value: string
}

/*
 * Palette calée sur l'ambiance "yourgarden" plutôt que sur les couleurs saturées par défaut
 * de TipTap. Toutes assez claires pour que le texte --color-text (#201e1d) reste lisible
 * par-dessus.
 */
const highlightColors: HighlightColor[] = [
  { label: 'Mousse', value: '#e1eecc' },
  { label: 'Sauge', value: '#ccdbb2' },
  { label: 'Miel', value: '#f7e2a8' },
  { label: 'Terre cuite', value: '#f2c9b4' },
  { label: 'Ciel', value: '#cfe0f0' },
  { label: 'Lilas', value: '#ded3ee' },
]

interface ColorHighlightPopoverProps {
  editor: Editor
}

export const ColorHighlightPopover = ({ editor }: ColorHighlightPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // useEditorState re-rend le composant quand la sélection bouge — sans ça, la pastille
  // active ne se mettrait à jour qu'au prochain changement de contenu.
  const { isActive, activeColor } = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      isActive: instance.isActive('highlight'),
      activeColor: instance.getAttributes('highlight').color as string | undefined,
    }),
  })

  // Fermeture au clic extérieur et à Échap. On écoute `pointerdown` (et pas `click`) pour
  // fermer avant que le focus ne parte ailleurs.
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      editor.chain().focus().run()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, editor])

  const applyColor = (color: string): void => {
    // toggleHighlight : recliquer la couleur déjà active la retire, comme dans TipTap UI.
    editor.chain().focus().toggleHighlight({ color }).run()
    setIsOpen(false)
  }

  const removeHighlight = (): void => {
    editor.chain().focus().unsetHighlight().run()
    setIsOpen(false)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <Button
        variant={ButtonVariant.Icon}
        title="Surligner"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={isActive ? styles.triggerActive : ''}
        // preventDefault sur mousedown : sinon le bouton vole le focus à l'éditeur et
        // la sélection de texte se vide avant qu'on ait pu lui appliquer la couleur.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className={styles.triggerGlyph}
          style={{ background: activeColor ?? 'transparent' }}
          aria-hidden="true"
        >
          A
        </span>
      </Button>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Couleur de surbrillance">
          <div className={styles.swatches}>
            {highlightColors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={activeColor === color.value}
                className={`${styles.swatch} ${activeColor === color.value ? styles.swatchActive : ''}`}
                style={{ background: color.value }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyColor(color.value)}
              />
            ))}
          </div>

          <Button
            variant={ButtonVariant.Ghost}
            className={styles.remove}
            disabled={!isActive}
            onMouseDown={(event) => event.preventDefault()}
            onClick={removeHighlight}
          >
            Retirer la surbrillance
          </Button>
        </div>
      )}
    </div>
  )
}
