import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

import styles from './Input.module.css'

/*
 * Deux primitives dans un même fichier parce qu'elles partagent le même style de base
 * (couleur, caret, bordure) et qu'elles vont toujours ensemble dans les formulaires.
 */

export const Input = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${styles.field} ${styles.input} ${className ?? ''}`.trim()} {...rest} />
)

export const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${styles.field} ${styles.textarea} ${className ?? ''}`.trim()} {...rest} />
)
