import type { NextConfig } from 'next'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const unimportLoaderOptions = {
  imports: [
    { name: 'useState', from: 'react' },
    { name: 'useEffect', from: 'react' },
    { name: 'useCallback', from: 'react' },
    { name: 'useMemo', from: 'react' },
  ],
  dts: 'auto-imports.d.ts',
}

const nextConfig: NextConfig = {
  turbopack: {
    // unimport-loader：不设置 as，保留原扩展，避免虚拟模块路径变成 *.tsx.tsx
    rules: {
      '*.{tsx,ts,jsx,js}': {
        condition: { not: 'foreign' },
        loaders: [
          { loader: require.resolve('unimport-loader'), options: unimportLoaderOptions },
        ],
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(tsx|ts|jsx|js)$/,
      use: [
        {
          loader: require.resolve('unimport-loader'),
          options: unimportLoaderOptions,
        },
      ],
    })
    return config
  },
}

export default nextConfig
