/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable regexp/optimal-quantifier-concatenation */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import loader from '../src'

function runLoader(source: string, options = {}, resourcePath = '/test/file.js') {
  return new Promise<{ code: string, map?: any }>((resolve, reject) => {
    const ctx: any = {
      resourcePath,
      getOptions: () => options,
      async() {
        return (err: Error | null, result?: string, map?: any) => {
          if (err)
            return reject(err)
          resolve({ code: result || '', map })
        }
      },
      emitWarning() {},
    }
    loader.call(ctx, source)
  })
}

describe('unimport-loader', () => {
  it('injects named import for used identifier (JS)', async () => {
    const options = { imports: [{ name: 'ref', from: 'vue' }] }
    const src = 'const count = ref(0)'
    const { code } = await runLoader(src, options)
    expect(code).toBe(`import { ref } from 'vue';
const count = ref(0)`)
  })

  it('injects import at the end when injectAtEnd is true', async () => {
    const options = { imports: [{ name: 'foo', from: 'bar' }], injectAtEnd: true }
    const src = 'console.log(foo)'
    const { code } = await runLoader(src, options)
    expect(code).toBe(`import { foo } from 'bar';
console.log(foo)`)
  })

  it('handles TSX/JSX style usage', async () => {
    const options = { imports: [{ name: 'useState', from: 'react' }] }
    const src = 'function Comp(){ const [s, setS] = useState(0); return <div>{s}</div> }'
    const { code } = await runLoader(src, options, '/test/file.jsx')
    expect(code).toBe(`import { useState } from 'react';
function Comp(){ const [s, setS] = useState(0); return <div>{s}</div> }`)
  })

  it('injects import for JSX component like <Button>', async () => {
    const options = {
      imports: [
        { name: 'Button', from: './components/Button' },
        { name: 'useState', from: 'react' },
      ],
    }
    const src = `export function App() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Click me</Button>
    </div>
  )
}`
    const { code } = await runLoader(src, options, '/test/App.jsx')
    expect(code).toMatch(/import \{ Button \} from '\.\/components\/Button'/)
    expect(code).toMatch(/import \{ useState \} from 'react'/)
    expect(code).toContain('<Button onClick')
    expect(code).toContain('>Click me</Button>')
  })

  it('handles TSX files', async () => {
    const options = { imports: [{ name: 'useState', from: 'react' }] }
    const src = 'function Comp(): JSX.Element { const [s, setS] = useState(0); return <div>{s}</div> }'
    const { code } = await runLoader(src, options, '/test/file.tsx')
    expect(code).toBe(`import { useState } from 'react';
function Comp(): JSX.Element { const [s, setS] = useState(0); return <div>{s}</div> }`)
  })

  it('injects default import for used identifier', async () => {
    const options = { imports: [{ name: 'default', as: 'Vue', from: 'vue' }] }
    const src = 'const app = Vue.createApp({})'
    const { code } = await runLoader(src, options)
    expect(code).toBe(`import Vue from 'vue';
const app = Vue.createApp({})`)
  })

  it('injects namespace import for used identifier', async () => {
    const options = { imports: [{ name: '*', as: 'React', from: 'react' }] }
    const src = 'const element = React.createElement(\'div\')'
    const { code } = await runLoader(src, options)
    expect(code).toBe(`import * as React from 'react';
const element = React.createElement('div')`)
  })

  it('uses presets', async () => {
    const options = { presets: ['vue'] }
    const src = 'const count = ref(0)'
    const { code } = await runLoader(src, options)
    expect(code).toBe(`import { ref } from 'vue';
const count = ref(0)`)
  })

  it('handles TypeScript files', async () => {
    const options = { imports: [{ name: 'ref', from: 'vue' }] }
    const src = 'const count: Ref<number> = ref(0)'
    const { code } = await runLoader(src, options, '/test/file.ts')
    expect(code).toBe(`import { ref } from 'vue';
const count: Ref<number> = ref(0)`)
  })

  it('does not inject when identifier is not used', async () => {
    const options = { imports: [{ name: 'ref', from: 'vue' }] }
    const src = 'const count = 0'
    const { code } = await runLoader(src, options)
    expect(code).toBe('const count = 0')
  })

  it('returns original source when no changes', async () => {
    const options = { imports: [{ name: 'ref', from: 'vue' }] }
    const src = 'const count = 0'
    const { code } = await runLoader(src, options)
    expect(code).toBe(src)
  })

  it('keeps "use client" directive first when auto-importing (TSX)', async () => {
    const options = { imports: [{ name: 'useState', from: 'react' }] }
    const src = `'use client'

export default function Comp() {
  const [s, setS] = useState(0)
  return <div>{s}</div>
}`
    const { code } = await runLoader(src, options, '/test/file.tsx')
    expect(code).toMatch(/^'use client'\s*\n+\s*import \{ useState \} from 'react'/)
    expect(code).not.toMatch(/^import.*'use client'/m)
  })

  it('keeps "use client" directive first when auto-importing (TS with no existing imports)', async () => {
    const options = { imports: [{ name: 'foo', from: 'bar' }] }
    const src = `'use client'

export function useFoo() {
  return foo()
}`
    const { code } = await runLoader(src, options, '/test/file.ts')
    expect(code).toMatch(/^'use client'\s*\n+\s*import \{ foo \} from 'bar'/)
    expect(code).not.toMatch(/^import.*'use client'/m)
  })

  it('keeps "use client" first with multiple auto-injected imports (TSX)', async () => {
    const options = {
      imports: [
        { name: 'useState', from: 'react' },
        { name: 'useEffect', from: 'react' },
      ],
    }
    const src = `'use client'

export default function Comp() {
  const [s, setS] = useState(0)
  useEffect(() => {}, [])
  return <div>{s}</div>
}`
    const { code } = await runLoader(src, options, '/test/file.tsx')
    expect(code).toMatch(/^'use client'\s*\n+\s*import /)
    expect(code).toMatch(/import \{ useState, useEffect \} from 'react'|import \{ useEffect, useState \} from 'react'/)
    expect(code).not.toMatch(/^import.*'use client'/m)
  })

  it('keeps "use client" first with existing imports + auto-injected imports (TSX)', async () => {
    const options = { imports: [{ name: 'useState', from: 'react' }] }
    const src = `'use client'

import Image from 'next/image'

export default function Comp() {
  const [s, setS] = useState(0)
  return (
    <div>
      <Image src="/x" alt="x" width={1} height={1} />
      {s}
    </div>
  )
}`
    const { code } = await runLoader(src, options, '/test/file.tsx')
    expect(code).toMatch(/^'use client'\s*\n+/)
    expect(code).toMatch(/import Image from 'next\/image'/)
    expect(code).toMatch(/import \{ useState \} from 'react'/)
    const useClientPos = code.indexOf('\'use client\'')
    const imageImportPos = code.indexOf('import Image')
    const useStateImportPos = code.indexOf('import { useState }')
    expect(useClientPos).toBeLessThan(imageImportPos)
    expect(useClientPos).toBeLessThan(useStateImportPos)
  })

  it('does not inject self-import when transforming file that defines the symbol (dirs)', async () => {
    const hooksDir = resolve(__dirname, 'fixtures', 'hooks')
    const useScopePath = resolve(hooksDir, 'use-scope.ts')
    const source = readFileSync(useScopePath, 'utf-8')
    const { code } = await runLoader(source, { dirs: [hooksDir] }, useScopePath)
    expect(code).toBe(source)
    expect(code).not.toMatch(/import\s*\{\s*useScope\s*\}\s*from/)
  })
})
