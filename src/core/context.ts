import type { SourceMap } from 'magic-string'
import type { BuiltinPresetName, Preset } from 'unimport'
import type { LoaderContext } from 'webpack'
import type { LoaderOptions } from '../types'

import { dirname, isAbsolute, join, relative } from 'node:path'
import process from 'node:process'

import { toArray } from '@antfu/utils'
import MagicString from 'magic-string'
import { findStaticImports, parseStaticImport } from 'mlly'

import { createUnimport, stringifyImports, stripCommentsAndStrings } from 'unimport'

import { presets } from '../presets'
import { detectIsJsxResource } from '../shared/helpers'
import { logger } from '../shared/logger'

import { emitDts, flattenImports, generateDtsContent, prepareSourceCode } from './utils'

/** Match 'use client' | 'use server' | 'use strict' at file start (Next.js / React Server Components) */
const DIRECTIVE_RE = /^\s*['"]use\s+(?:client|server|strict)['"]\s*;?\s*/

function getDirectiveEndIndex(source: string): number {
  const match = source.match(DIRECTIVE_RE)
  return match ? match[0].length : 0
}

/** Ensure directive like 'use client' stays first, before imports (required by Next.js) */
function ensureDirectiveFirst(source: string, code: string): string {
  const directiveMatch = source.match(DIRECTIVE_RE)
  if (!directiveMatch)
    return code
  const directive = directiveMatch[0]
  const directiveStr = directive.trim()
  if (code.trimStart().startsWith(directiveStr))
    return code
  if (!code.trimStart().startsWith('import'))
    return code
  const dirIndex = code.indexOf(directiveStr)
  if (dirIndex < 0)
    return code
  const beforeDir = code.slice(0, dirIndex).trim()
  const afterDir = code.slice(dirIndex + directiveStr.length).trimStart()
  const sep = directive.endsWith('\n') ? '\n' : '\n\n'
  return `${directive}${sep}${beforeDir}\n\n${afterDir}`
}

function resolvePresets(presetInput: LoaderOptions['presets']): (Preset | BuiltinPresetName)[] {
  return toArray(presetInput).flatMap((p) => {
    if (typeof p === 'string' && p in presets)
      return presets[p as keyof typeof presets]
    return p as Preset | BuiltinPresetName
  })
}

export interface Context {
  readonly unimport: ReturnType<typeof createUnimport>
  readonly options: LoaderOptions
  transform: (filePath: string, source: string) => Promise<{ code: string, map?: SourceMap } | null>
  emitDts: (loaderContext: LoaderContext<LoaderOptions>) => Promise<void>
  /** Generate d.ts content (for testing or programmatic use) */
  generateDts: (file: string) => Promise<string>
}

export async function createContext(options: LoaderOptions): Promise<Context> {
  if (options.logLevel) {
    logger.level = options.logLevel
  }

  const unimport = createUnimport({
    imports: await flattenImports(options.imports || []),
    dirs: options.dirs || [],
    presets: resolvePresets(options.presets),
    injectAtEnd: true,
    // dirs 扫描会生成绝对路径，Turbopack 等 bundler 可能无法解析，转为相对路径
    resolveId: (id, parentId) => {
      if (!parentId || !isAbsolute(id))
        return id
      try {
        const rel = relative(dirname(parentId), id).replace(/\\/g, '/')
        return rel.startsWith('.') ? rel : `./${rel}`
      }
      catch {
        return id
      }
    },
  })

  await unimport.init()

  async function transformRegularFile(filePath: string, source: string) {
    const content = new MagicString(source)
    const result = await unimport.injectImports(content, filePath)

    if (!result.s.hasChanged()) {
      return null
    }

    logger.info(`Injected imports for ${filePath}`)
    const code = ensureDirectiveFirst(source, result.s.toString())
    return {
      code,
      map: result.s.generateMap({ source: filePath, includeContent: true, hires: true }),
    }
  }

  async function transformJsxFile(filePath: string, source: string) {
    const normalizedSource = await prepareSourceCode(filePath, source)
    const normalizedContent = new MagicString(normalizedSource)
    const result = await unimport.injectImports(normalizedContent, filePath)

    if (!result.s.hasChanged()) {
      return null
    }

    const originalContent = new MagicString(source)
    const { isCJSContext, firstOccurrence } = await unimport.detectImports(originalContent)
    const strippedCode = stripCommentsAndStrings(originalContent.original)

    let insertionIndex = findStaticImports(originalContent.original)
      .filter(i => Boolean(strippedCode.slice(i.start, i.end).trim()))
      .map(i => parseStaticImport(i))
      .reverse()
      .find(i => i.end <= firstOccurrence)
      ?.end ?? 0
    if (insertionIndex === 0) {
      const directiveEnd = getDirectiveEndIndex(originalContent.original)
      if (directiveEnd > 0)
        insertionIndex = directiveEnd
    }

    const importStatements = stringifyImports(result.imports, isCJSContext)
    if (importStatements && insertionIndex >= 0) {
      originalContent.appendRight(insertionIndex, `\n${importStatements}\n`)
    }
    else {
      originalContent.prepend(`${importStatements}\n`)
    }

    logger.info(`Injected imports for ${filePath}`)
    return {
      code: originalContent.toString(),
      map: originalContent.generateMap({ source: filePath, includeContent: true, hires: true }),
    }
  }

  return {
    unimport,
    options,

    async transform(filePath: string, source: string) {
      const isJSX = detectIsJsxResource(filePath)
      const result = isJSX
        ? await transformJsxFile(filePath, source)
        : await transformRegularFile(filePath, source)

      return result || { code: source }
    },

    async emitDts(loaderContext: LoaderContext<LoaderOptions>) {
      await emitDts(unimport, options, loaderContext)
    },

    async generateDts(file: string) {
      const dtsDir = dirname(join(process.cwd(), file))
      return generateDtsContent(unimport, dtsDir)
    },
  }
}
