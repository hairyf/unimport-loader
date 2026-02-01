import type { InlinePreset } from 'unimport'

export const vitepress: InlinePreset = {
  from: 'vitepress',
  imports: [
    'useData',
    'useRoute',
    'useRouter',
    'withBase',
  ],
}
