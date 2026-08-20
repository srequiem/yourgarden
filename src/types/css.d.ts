/*
 * Déclaration des feuilles de style importées depuis un paquet npm.
 *
 * Pourquoi ce fichier existe : Next ne déclare que `*.module.css` (voir
 * node_modules/next/types/global.d.ts). Pour une CSS globale, TypeScript retire
 * l'extension et cherche un `.ts` / `.d.ts` / `.js` du même nom, ne trouve rien, et
 * considère le module comme non résolu.
 *
 * `tsc` n'en fait pas une erreur — un import à effet de bord seul ne lui demande aucun
 * type, il laisse donc passer. Mais le service de langage de l'éditeur, lui, signale la
 * résolution échouée : d'où le soulignement rouge alors que le build et le typecheck
 * passent. Le bundler, de son côté, a toujours su quoi en faire.
 *
 * Déclaration volontairement nominative plutôt qu'un `declare module '*.css'` général :
 * un joker attraperait aussi les `*.module.css`, et même si TypeScript privilégie le
 * motif le plus long, autant ne pas mettre en jeu le typage des CSS Modules — dont
 * dépend chaque `styles.maClasse` du projet — pour économiser une ligne. Ajouter une
 * entrée le jour où une autre bibliothèque livrera sa CSS est un coût dérisoire.
 */
declare module 'lenis/dist/lenis.css'
