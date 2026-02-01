import type { InlinePreset } from 'unimport'

export const vueRouterComposables: InlinePreset = {
  from: 'vue-router/composables',
  imports: [
    'useRouter',
    'useRoute',
    'useLink',
    'onBeforeRouteLeave',
    'onBeforeRouteUpdate',
  ],
}
