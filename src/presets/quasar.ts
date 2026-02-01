import type { InlinePreset } from 'unimport'

export const quasar: InlinePreset = {
  from: 'quasar',
  imports: [
    'useQuasar',
    'useDialogPluginComponent',
    'useFormChild',
    'useMeta',
  ],
}
