// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    ignores: [
      'test/fixtures/**',
      'playground/**',
    ],
    rules: {
      'ts/explicit-function-return-type': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
