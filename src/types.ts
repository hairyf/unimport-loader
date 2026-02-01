import type { Arrayable } from '@antfu/utils'
import type { LogLevel } from 'consola'
import type { BuiltinPresetName, Import, InlinePreset, Preset } from 'unimport'

import type { PresetName } from './presets'

export type ImportNameAlias = [string, string]

export type ImportsMap = Record<string, (string | ImportNameAlias)[]>

/** Extended preset names (unimport builtin + react-dom, ahooks, jotai, etc.) */
export type { BuiltinPresetName, PresetName }

export interface LoaderOptions {
  imports?: Arrayable<Import | ImportsMap | InlinePreset>
  dirs?: string[]
  /** Preset names or custom presets. Use `presets` from unimport-loader for full list. */
  presets?: Arrayable<Preset | PresetName>
  /** emit generated d.ts; true -> `auto-imports.d.ts` or string filename */
  dts?: string | boolean
  /** ref: https://github.com/unjs/consola#log-level */
  logLevel?: LogLevel
  [key: string]: any
}
