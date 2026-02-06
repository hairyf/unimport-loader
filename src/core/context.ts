import type { SourceMap } from 'magic-string'
import type { BuiltinPresetName, Preset } from 'unimport'
import type { LoaderContext } from 'webpack'
import type { LoaderOptions } from '../types'

import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'

import { toArray } from '@antfu/utils'
import MagicString from 'magic-string'
import { findStaticImports, parseStaticImport } from 'mlly'

import { createUnimport } from 'unimport'

import { presets } from '../presets'
import { detectIsJsxResource, getJsxComponentTagNames } from '../shared/helpers'
import { logger } from '../shared/logger'

import { emitDts, flattenImports, generateDtsContent } from './utils'

/** 注入并随后移除，用于让 unimport 识别 JSX 中的组件名 */
const JSX_REFS_SENTINEL = '__unimport_loader_jsx'
const JSX_REFS_LINE_RE = /\/\* __unimport_loader_jsx \*\/[^\n]*\n?/g

/** Match 'use client' | 'use server' | 'use strict' at file start (Next.js / React Server Components) */
const DIRECTIVE_RE = /^\s*['"]use\s+(?:client|server|strict)['"]\s*;?\s*/

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

/** Collect all imported names (default + named) from existing static imports */
function getExistingImportedNames(source: string): Set<string> {
  const names = new Set<string>()
  const imports = findStaticImports(source)
  for (const imp of imports) {
    try {
      const parsed = parseStaticImport(imp)
      if (parsed.defaultImport)
        names.add(parsed.defaultImport)
      if (parsed.namespacedImport)
        names.add(parsed.namespacedImport)
      if (parsed.namedImports) {
        for (const alias of Object.values(parsed.namedImports))
          names.add(alias)
      }
    }
    catch {
      // ignore parse errors
    }
  }
  return names
}

/** Check if two paths resolve to the same file (for self-import detection) */
function isSameFile(filePath: string, importFrom: string): boolean {
  try {
    const absFile = resolve(filePath)
    const absImport = isAbsolute(importFrom)
      ? resolve(importFrom)
      : resolve(dirname(filePath), importFrom)
    return absFile === absImport
  }
  catch {
    return false
  }
}

/** Filter out imports that would cause "defined multiple times" (already imported or self-import) */
function filterDuplicateImports(
  imports: Array<{ name: string, as?: string, from: string }>,
  filePath: string,
  source: string,
): Array<{ name: string, as?: string, from: string }> {
  const existingNames = getExistingImportedNames(source)
  return imports.filter((i) => {
    const as = i.as ?? i.name
    if (existingNames.has(as))
      return false
    if (isSameFile(filePath, i.from))
      return false
    return true
  })
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

  const dedupeAddon = {
    name: 'unimport-loader:dedupe',
    injectImportsResolved(imports: Array<{ name: string, as?: string, from: string }>, s: MagicString, id?: string) {
      if (!id)
        return imports
      const source = typeof s.original === 'string' ? s.original : s.toString()
      return filterDuplicateImports(imports, id, source)
    },
  }

  const unimport = createUnimport({
    imports: await flattenImports(options.imports || []),
    dirs: options.dirs || [],
    presets: resolvePresets(options.presets),
    injectAtEnd: true,
    addons: [dedupeAddon],
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

  async function transformFile(filePath: string, source: string) {
    let refsLine = ''
    let input = source
    if (detectIsJsxResource(filePath)) {
      const tagNames = getJsxComponentTagNames(source)
      if (tagNames.length > 0) {
        refsLine = `/* ${JSX_REFS_SENTINEL} */ void (${tagNames.join(', ')});\n`
        input = refsLine + input
      }
    }

    const content = new MagicString(input)
    const result = await unimport.injectImports(content, filePath)

    if (!result.s.hasChanged()) {
      return null
    }

    let code = result.s.toString()
    if (refsLine)
      code = code.replace(refsLine, '').replace(JSX_REFS_LINE_RE, '') // 精确移除 + 正则兜底

    logger.info(`Injected imports for ${filePath}`)
    code = ensureDirectiveFirst(source, code)
    return {
      code,
      map: result.s.generateMap({ source: filePath, includeContent: true, hires: true }),
    }
  }

  return {
    unimport,
    options,

    async transform(filePath: string, source: string) {
      const result = await transformFile(filePath, source)
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
