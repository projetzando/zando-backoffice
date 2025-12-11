/**
 * Configuration des toasts de notification
 */

export enum ToastColor {
  PRIMARY = 'primary',
  SUCCESS = 'green',
  ERROR = 'red',
  WARNING = 'orange',
  INFO = 'blue',
}

export enum ToastIcon {
  SUCCESS = 'i-heroicons-check-badge',
  ERROR = 'i-heroicons-x-circle',
  WARNING = 'i-heroicons-exclamation-triangle',
  INFO = 'i-heroicons-information-circle',
}

export const TOAST_TIMEOUT = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const

/**
 * Configuration par défaut des toasts
 */
export const DEFAULT_TOAST_CONFIG = {
  timeout: TOAST_TIMEOUT.NORMAL,
}
