import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { glob } from 'tinyglobby'
import { describe, expect, it } from 'vitest'
import { createContext } from '../src/core/context'

describe('transform', async () => {
  const ctx = await createContext({
    presets: ['vue', 'pinia', 'quasar', 'react'],
    imports: [
      {
        'custom': [
          'customNamed',
          ['default', 'customDefault'],
          ['default', 'customDefaultAlias'],
        ],
        'vue-dollar': ['$'],
        'three.js': [['*', 'THREE']],
      },
    ],
    ignore: ['ignored', 'useId'],
  })

  const root = resolve(__dirname, 'fixtures')
  const files = await glob('*', { cwd: root, onlyFiles: true })

  for (const file of files) {
    it(file, async () => {
      const fixture = readFileSync(resolve(root, file), 'utf-8')
      const pass1 = (await ctx.transform(resolve(root, file), fixture))?.code ?? fixture
      expect(pass1).toMatchSnapshot()
      const pass2 = (await ctx.transform(resolve(root, file), pass1))?.code ?? pass1
      expect(pass2).toBe(pass1)
    })
  }
})
