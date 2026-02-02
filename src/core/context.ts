import type { SourceMap } from 'magic-string'
import type { BuiltinPresetName, Preset } from 'unimport'
import type { LoaderContext } from 'webpack'
import type { LoaderOptions } from '../types'

import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'

import { toArray } from '@antfu/utils'
import MagicString from 'magic-string'
import { findStaticImports, parseStaticImport } from 'mlly'

import { createUnimport, stringifyImports, stripCommentsAndStrings } from 'unimport'

import { presets } from '../presets'
import { detectIsJsxResource } from '../shared/helpers'
import { logger } from '../shared/logger'

import { emitDts, flattenImports, generateDtsContent, prepareSourceCode } from './utils'

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
    // dirs 扫描会生成绝对路径，Turbopack 等 bundler 可能无法解析，转为相对路径。
    // 当解析目标与当前文件相同时返回 parentId，以便 unimport 过滤自引用，避免 "defined multiple times"。
    resolveId: (id, parentId) => {
      if (!parentId || !isAbsolute(id))
        return id
      try {
        const absId = resolve(id)
        const absParent = resolve(parentId)
        if (absId === absParent)
          return parentId
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
    return {
      code: result.s.toString(),
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

    const insertionIndex = findStaticImports(originalContent.original)
      .filter(i => Boolean(strippedCode.slice(i.start, i.end).trim()))
      .map(i => parseStaticImport(i))
      .reverse()
      .find(i => i.end <= firstOccurrence)
      ?.end ?? 0

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
