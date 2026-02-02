import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/.temp/**', '**/temp/**'],
    server: {
      deps: {
        inline: ['vitest-package-exports'],
      },
    },
  },
})
