import { join } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { createContext } from '../src/core/context'

describe('dts', () => {
  it('normal', async () => {
    const cwd = process.cwd()
    const ctx = await createContext({
      presets: ['vue', 'react'],
      imports: [
        {
          custom: [
            'customNamed',
            ['default', 'customDefault'],
          ],
          custom2: [['*', 'custom2']],
        },
      ],
    })

    expect(await ctx.generateDts(join(cwd, 'index.d.ts'))).toMatchSnapshot()
  })
})
