import type { InlinePreset } from 'unimport'

export const mobxReactLite: InlinePreset = {
  from: 'mobx-react-lite',
  imports: [
    'observer',
    'Observer',
    'useLocalObservable',
  ],
}
