import type { LoaderContext } from 'webpack'

import type { LoaderOptions } from '../types'

import { createContext } from './context'

export default async function loader(this: LoaderContext<LoaderOptions>, source: string): Promise<void | string> {
  const callback = this.async()
  const options: LoaderOptions = (this.getOptions ? this.getOptions() : {})
  const filePath = this.resourcePath

  try {
    const ctx = await createContext(options)

    await ctx.emitDts(this)

    const result = await ctx.transform(filePath, source)

    if (result) {
      return callback(null, result.code, result.map)
    }

    return callback(null, source)
  }
  catch (err) {
    if (err instanceof Error) {
      return callback(err)
    }
    else {
      return callback(new Error(String(err)))
    }
  }
}
