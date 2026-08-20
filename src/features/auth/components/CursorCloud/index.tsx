'use client'

import { useEffect, useRef } from 'react'

import styles from './CursorCloud.module.css'

/*
 * Nuage traversé au curseur, sur la page de connexion.
 *
 * L'idée : le geste laisse des formes dans une brume, qui se dissipent ensuite.
 *
 * Trois principes, dont deux tirés d'une version précédente qui ne marchait pas :
 *
 *   1. On dessine des TRAITS, pas des taches rondes. Empiler des disques ne produit
 *      jamais une forme — au mieux un halo, au pire une bille sous le curseur. Un
 *      segment tracé le long du déplacement, lui, a une direction et une longueur :
 *      c'est un geste, donc une forme.
 *
 *   2. Le flou est fait par le CSS sur le canvas entier, pas par le pinceau. On peut
 *      donc tracer des traits francs et bien opaques — c'est le flou qui les transforme
 *      en volutes. C'est aussi ce qui permet d'être VISIBLE : la version précédente
 *      diluait chaque dépôt à 1,8 % d'opacité pour éviter la saturation, ce qui revenait
 *      à ne rien peindre du tout. Ici la dilution est optique, pas chromatique.
 *
 *   3. On ne dessine QUE le nouveau segment, et seulement si le curseur a bougé. Rien
 *      n'est redéposé à l'arrêt : plus aucune forme ne peut se construire sous une souris
 *      immobile, la brume existante finit simplement de s'effacer.
 *
 * L'effacement progressif (`destination-out`, quelques pour cent par frame) reste ce qui
 * donne la persistance : un trait vieux d'une seconde n'a pas fini de disparaître.
 *
 * Le canvas tourne à 30 % de la résolution écran : l'agrandissement par le navigateur
 * adoucit déjà beaucoup, le flou CSS n'a plus qu'à finir le travail. Et il déborde du
 * viewport, sinon le flou révélerait ses propres bords en vignette sur le pourtour.
 */

/** Résolution du canvas, en fraction de celle de l'écran. */
const SCALE = 0.3
/** Débordement du canvas hors du viewport, en pixels CSS, pour cacher les bords du flou. */
const OVERSCAN = 90
/** Part effacée à chaque frame. Plus bas = les formes persistent plus longtemps. */
const FADE = 0.03
/** Opacité du trait. Généreuse : c'est le flou qui la diluera. */
const STROKE_ALPHA = 0.5
/** Épaisseur de base du trait, en fraction du plus petit côté du canvas. */
const WIDTH_RATIO = 0.085
/** Rapprochement vers le curseur à chaque frame. Assez haut pour que le trait suive le geste. */
const LERP = 0.3
/** En deçà de cette distance (en px canvas), on considère que le curseur est à l'arrêt. */
const MIN_SEGMENT = 0.4
/** Distance parcourue, en pixels, pour passer d'une couleur de la palette à la suivante. */
const COLOR_TRAVEL = 650

const COLOR_TOKENS = ['--color-accent', '--color-accent-2-300', '--color-accent-600']

type Rgb = [number, number, number]

const mix = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t)

export const CursorCloud = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /*
     * Deux abstentions volontaires :
     *   - sans curseur fin (tactile), il n'y a pas de survol : l'effet n'aurait aucun sens
     *     et laisserait une forme figée au dernier point touché ;
     *   - `prefers-reduced-motion` doit couper la boucle rAF, ce que la règle CSS globale
     *     de globals.css ne peut pas faire.
     */
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = canvas.getContext('2d')
    if (!context) return

    /*
     * Normalise n'importe quelle couleur CSS en RGB : on l'assigne à fillStyle, que le
     * navigateur nous restitue en `#rrggbb`. Évite d'écrire un parseur pour les notations
     * présentes dans les tokens (hex et rgb()).
     */
    const toRgb = (value: string): Rgb => {
      context.fillStyle = '#000000'
      context.fillStyle = value.trim()
      const hex = context.fillStyle as string
      return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)) as Rgb
    }

    const rootStyle = getComputedStyle(document.documentElement)
    const palette = COLOR_TOKENS.map((token) => toRgb(rootStyle.getPropertyValue(token)))

    let width = 0
    let height = 0
    let baseWidth = 0

    const resize = (): void => {
      const cssWidth = window.innerWidth + OVERSCAN * 2
      const cssHeight = window.innerHeight + OVERSCAN * 2

      /* Taille de la mémoire de tracé : réduite, car le flou fera le reste. */
      width = Math.max(1, Math.round(cssWidth * SCALE))
      height = Math.max(1, Math.round(cssHeight * SCALE))
      canvas.width = width
      canvas.height = height

      /*
       * Taille et position d'affichage, posées explicitement.
       *
       * Un <canvas> est un élément remplacé : il possède une taille intrinsèque, celle de
       * ses attributs width/height. Un `inset: -90px` seul ne l'étire donc PAS — `width`
       * reste à `auto`, qui pour un élément remplacé vaut la taille intrinsèque. Le canvas
       * s'affichait alors à 30 % de la taille voulue, coincé en haut à gauche, pendant que
       * les coordonnées du curseur, elles, restaient calculées pour le plein écran.
       *
       * On donne donc top/left ET width/height, sans right/bottom : aucune contrainte
       * contradictoire à arbitrer, et le débordement ne vit qu'ici.
       */
      canvas.style.top = `${-OVERSCAN}px`
      canvas.style.left = `${-OVERSCAN}px`
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      baseWidth = Math.max(8, Math.min(width, height) * WIDTH_RATIO)
      /* Redimensionner un canvas réinitialise son contexte : les réglages de tracé
         doivent être reposés, sinon les jointures redeviennent carrées. */
      context.lineCap = 'round'
      context.lineJoin = 'round'
    }

    resize()
    window.addEventListener('resize', resize)

    const pointer = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let previous = { x: 0, y: 0 }
    let hasPointer = false
    let travel = 0

    const onPointerMove = (event: PointerEvent): void => {
      pointer.x = (event.clientX + OVERSCAN) * SCALE
      pointer.y = (event.clientY + OVERSCAN) * SCALE
      /* Première apparition : on téléporte le pinceau sous le curseur, sinon il
         traverserait l'écran depuis l'origine en laissant une balafre. */
      if (!hasPointer) {
        current.x = pointer.x
        current.y = pointer.y
        previous = { ...current }
        hasPointer = true
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    let frame = 0

    const render = (): void => {
      frame = requestAnimationFrame(render)

      context.globalCompositeOperation = 'destination-out'
      context.fillStyle = `rgba(0, 0, 0, ${FADE})`
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'

      if (!hasPointer) return

      current.x += (pointer.x - current.x) * LERP
      current.y += (pointer.y - current.y) * LERP

      const deltaX = current.x - previous.x
      const deltaY = current.y - previous.y
      const distance = Math.hypot(deltaX, deltaY)

      /*
       * Le seuil est la garantie qu'aucune forme n'apparaît sous une souris immobile.
       * On sort AVANT de tracer et sans mettre `previous` à jour : au prochain geste, le
       * trait repartira exactement d'où le précédent s'est arrêté, sans rupture.
       */
      if (distance < MIN_SEGMENT) return

      travel += distance

      /* La teinte avance avec la distance parcourue, pas avec le temps : c'est le geste
         qui fait tourner la couleur, pas l'attente. */
      const position = (travel / COLOR_TRAVEL) % palette.length
      const index = Math.floor(position)
      const blend = position - index
      const from = palette[index]
      const to = palette[(index + 1) % palette.length]
      const r = mix(from[0], to[0], blend)
      const g = mix(from[1], to[1], blend)
      const b = mix(from[2], to[2], blend)

      /*
       * L'épaisseur diminue avec la vitesse. Un geste lent laisse une trace pleine, un
       * geste vif un filament — c'est le comportement d'un pinceau, et c'est ce qui
       * distingue une forme dessinée d'une simple traînée d'épaisseur constante.
       */
      const speedRatio = Math.min(1, distance / (baseWidth * 0.9))
      context.lineWidth = baseWidth * (1 - speedRatio * 0.55)
      context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${STROKE_ALPHA})`

      context.beginPath()
      context.moveTo(previous.x, previous.y)
      context.lineTo(current.x, current.y)
      context.stroke()

      previous = { x: current.x, y: current.y }
    }

    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
