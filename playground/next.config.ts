import type { NextConfig } from 'next'
import type { LoaderOptions } from 'unimport-loader'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const unimportLoaderOptions: LoaderOptions = {
  // preset：react, react-dom, react-router, ahooks, jotai, recoil 等，参见 presets from unimport-loader
  presets: ['react', 'react-dom'],
  dts: true,

  // dirs: 扫描指定目录，将模块的 named exports 注册为自动导入
  dirs: ['./composables'],

  // imports: 显式指定要自动导入的 API，支持 npm 包或项目内路径（如 @/）
  imports: [
    { name: 'useId', from: 'react' },
  ],
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
}

export default nextConfig
