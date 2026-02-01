import type { InlinePreset } from 'unimport'

export const vueuseHead: InlinePreset = {
  from: '@vueuse/head',
  imports: ['useHead', 'useSeoMeta'],
}
