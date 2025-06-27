import { he_translations, TranslationKeys } from '../locales/he'

type PathToValue<T, Path extends string> = Path extends keyof T
  ? T[Path]
  : Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathToValue<T[Key], Rest>
    : never
  : never

type TranslationPath = {
  [K in keyof TranslationKeys]: K extends string
    ? TranslationKeys[K] extends object
      ? `${K}.${keyof TranslationKeys[K] & string}`
      : K
    : never
}[keyof TranslationKeys]

/**
 * Hook for accessing translations
 */
export const use_translation = () => {
  const translations = he_translations

  /**
   * Get translation by key path
   * @param key - Translation key path (e.g., 'common.save', 'nav.home')
   * @param params - Parameters to replace in the translation
   */
  const t = (key: TranslationPath, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key // Return key if value is not a string
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  /**
   * Check if a translation key exists
   */
  const has_translation = (key: TranslationPath): boolean => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return false
      }
    }

    return typeof value === 'string'
  }

  /**
   * Get all translations for a namespace
   */
  const get_namespace = (namespace: keyof TranslationKeys) => {
    return translations[namespace] || {}
  }

  return {
    t,
    has_translation,
    get_namespace,
    translations
  }
}