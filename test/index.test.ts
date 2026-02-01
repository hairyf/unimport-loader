import { describe, expect, it } from 'vitest'

import loader from '../src'

describe('unimport-loader', () => {
  it('exports loader as default', () => {
    expect(typeof loader).toBe('function')
  })
})
