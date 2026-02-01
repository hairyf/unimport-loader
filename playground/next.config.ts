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
          })
        ],
      },
    },
  },
}

export default nextConfig
