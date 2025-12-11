import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    typescript: true,
    stylistic: {
      semi: false,
      quotes: 'single',
    },
  },
}).append({
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
})
