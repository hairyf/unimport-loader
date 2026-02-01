# unimport-loader

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A loader that injects auto-imports using [unimport](https://github.com/unjs/unimport). Supports **Turbopack** (Next.js) and **Webpack**.

## Install

```bash
pnpm add -D unimport-loader
```

## Usage

### Turbopack (Next.js)

在 `next.config.ts` 中配置 `turbopack.rules`，使用 `unimport()` 作为 loader：

```ts
// next.config.ts
import type { NextConfig } from 'next'
import { unimport } from 'unimport-loader'

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.{tsx,ts,jsx,js}': {
        condition: { not: 'foreign' },
        loaders: [
          unimport({
            presets: ['react', 'react-dom'],
            dts: true,
            dirs: ['./composables'],
            imports: [
              { name: 'useId', from: 'react' },
            ],
          }),
        ],
      },
    },
  },
}

export default nextConfig
```

启用 Turbopack 开发：`next dev --turbopack`。

### Webpack

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|jsx|tsx)$/,
        use: [
          {
            loader: 'unimport-loader',
            options: {
              imports: [
                { name: 'ref', from: 'vue' },
                { name: 'computed', from: 'vue' },
              ],
              // or use presets
              presets: ['vue'],
              dts: true, // emit auto-imports.d.ts
            },
          },
        ],
      },
    ],
  },
}
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `imports` | `Arrayable<Import \| ImportsMap \| InlinePreset>` | Import definitions |
| `dirs` | `string[]` | Auto-import from directories |
| `presets` | `Preset[]` | Use unimport presets (e.g. `['vue']`) |
| `dts` | `string \| boolean` | Emit type declarations; `true` -> `auto-imports.d.ts` |
| `logLevel` | `LogLevel` | [consola](https://github.com/unjs/consola#log-level) log level |

## Note for Developers

This starter recommands using [npm Trusted Publisher](https://github.com/e18e/ecosystem-issues/issues/201), where the release is done on CI to ensure the security of the packages.

To do so, you need to run `pnpm publish` manually for the very first time to create the package on npm, and then go to `https://www.npmjs.com/package/<your-package-name>/access` to set the connection to your GitHub repo.

Then for the future releases, you can run `pnpm run release` to do the release and the GitHub Actions will take care of the release process.

## License

[MIT](./LICENSE) License © [hairy](https://github.com/hairy)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/unimport-loader?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/unimport-loader
[npm-downloads-src]: https://img.shields.io/npm/dm/unimport-loader?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/unimport-loader
[bundle-src]: https://img.shields.io/bundlephobia/minzip/unimport-loader?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=unimport-loader
[license-src]: https://img.shields.io/github/license/hairy/unimport-loader.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/hairy/unimport-loader/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/unimport-loader
