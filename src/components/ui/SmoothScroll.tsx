'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

import 'lenis/dist/lenis.css'

/*
 * Scroll lissé (lerp) façon Immersive Garden / Awwwards.
 *
 * Principe : le scroll natif ne déplace plus la page directement. Lenis garde une
 * position *cible* (là où la molette voudrait aller) et une position *courante* (là où
 * la page est réellement), puis rapproche la seconde de la première d'une fraction
 * constante à chaque frame — `current += (target - current) * lerp`. La page décélère
 * toujours vers sa destination au lieu d'y arriver sèchement : c'est ce qui donne la
 * sensation de masse.
 *
 * Pourquoi Lenis et pas une translation de wrapper (approche Locomotive v4) : le projet
 * compte deux `position: sticky` (l'aside du carnet, la toolbar de l'éditeur) et trois
 * `position: fixed` (les deux FAB, le décor ambiant). Un parent transformé cesse d'être
 * un référentiel viewport — les cinq casseraient. Lenis, lui, conserve le scroll natif
 * et se contente d'en piloter la position, donc sticky, fixed, barre de défilement,
 * ancres et navigation clavier survivent intacts.
 *
 * Monté une seule fois à la racine : le scroll est une propriété du document, pas d'une
 * page. Le remonter à chaque navigation réinitialiserait l'inertie en plein geste.
 */
export const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      /*
       * 0.08 plutôt que le 0.1 par défaut : plus la valeur est basse, plus la page met
       * de frames à rejoindre sa cible, donc plus le scroll paraît lourd. En dessous de
       * ~0.06 la latence cesse d'être une matière et devient une gêne.
       */
      lerp: 0.08,

      /*
       * Le tactile garde son inertie native. `syncTouch` ferait passer le doigt par le
       * même lissage, mais l'inertie d'iOS est déjà excellente et la doubler produit un
       * flottement caoutchouteux — c'est le réglage qui trahit le plus un site « à
       * effets ». Le lissage est donc réservé à la molette et au trackpad.
       */
      syncTouch: false,

      /*
       * Laisse défiler nativement toute zone scrollable survolée au lieu d'emporter la
       * page entière. Sans ça, la molette au-dessus du textarea du carnet du jour ferait
       * défiler l'article derrière au lieu du texte qu'on est en train de lire.
       */
      allowNestedScroll: true,

      /* Les ancres (#id) passent par le lissage au lieu de sauter d'un coup. */
      anchors: true,

      /* Lenis pilote sa propre boucle rAF : une seule, la sienne, et détruite avec lui. */
      autoRaf: true,
    })

    /*
     * `prefers-reduced-motion` est géré nativement par Lenis (option respectReducedMotion,
     * active par défaut) : il force alors lerp = 1, ce qui revient au scroll direct. La
     * règle globale de globals.css ne coupe que le CSS et n'aurait jamais arrêté cette
     * boucle JS — il aurait fallu l'écrire ici si la lib ne le faisait pas.
     */

    return () => lenis.destroy()
  }, [])

  return null
}
