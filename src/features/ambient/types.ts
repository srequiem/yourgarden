/*
 * Thèmes d'ambiance sonore proposés en mode écriture.
 * Cosmétique : au moment où on écrit ce scaffold, il n'y a pas encore de <audio> qui
 * joue vraiment ces thèmes — le toggle change juste le label. Quand tu voudras câbler
 * du vrai audio, une seule fonction à modifier dans useAmbientMusic.
 */

export enum AmbientTheme {
  Acoustic = 'Douceur acoustique',
  Piano = 'Piano du soir',
  Waves = 'Vagues & vent',
  Jazz = 'Jazz feutré',
  None = 'Sans musique',
}
