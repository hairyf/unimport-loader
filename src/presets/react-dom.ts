import type { InlinePreset } from 'unimport'

export const reactDom: InlinePreset = {
  from: 'react-dom',
  imports: [
    'useFormStatus',
    'createPortal',
    'flushSync',
    'preconnect',
    'prefetchDNS',
    'preinit',
    'preinitModule',
    'preload',
    'preloadModule',
  ],
}
