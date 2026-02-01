import type { InlinePreset } from 'unimport'

export const vuex: InlinePreset = {
  from: 'vuex',
  imports: [
    'createStore',
    'createLogger',
    'mapState',
    'mapGetters',
    'mapActions',
    'mapMutations',
    'createNamespacedHelpers',
    'useStore',
  ],
}
