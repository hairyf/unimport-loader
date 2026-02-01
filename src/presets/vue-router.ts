import type { InlinePreset } from 'unimport'

export const vueRouter: InlinePreset = {
  from: 'vue-router',
  imports: [
    'useRouter',
    'useRoute',
    'useLink',
    'onBeforeRouteLeave',
    'onBeforeRouteUpdate',
  ],
}
