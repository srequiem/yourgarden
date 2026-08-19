import type { ButtonHTMLAttributes } from 'react'

import styles from './Button.module.css'

/*
 * Bouton polymorphe à variantes. On garde les 4 variantes de l'original
 * (Primary, Secondary, Ghost, Icon) mais on passe des styles inline aux CSS Modules
 * pour rester cohérent avec la convention du reste du projet.
 *
 * `Danger` s'est ajoutée pour les actions destructrices (supprimer une publication).
 * Elle vit ici plutôt qu'en style ad hoc dans la page : le jour où une deuxième action
 * destructrice apparaît (supprimer un compte, vider le carnet du jour), elle doit avoir
 * exactement la même tête sans qu'on ait à recopier des couleurs à la main.
 */

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost',
  Icon = 'icon',
  Danger = 'danger',
  Clean = 'clean',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: styles.primary,
  [ButtonVariant.Secondary]: styles.secondary,
  [ButtonVariant.Ghost]: styles.ghost,
  [ButtonVariant.Icon]: styles.icon,
  [ButtonVariant.Danger]: styles.danger,
  [ButtonVariant.Clean]: styles.clean,
}

export const Button = ({
  variant = ButtonVariant.Primary,
  className,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={`${styles.base} ${variantClass[variant]} ${className ?? ''}`.trim()}
    {...rest}
  />
)
