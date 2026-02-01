import type { PackagePreset } from 'unimport'

/** Requires `@vueuse/core` to be installed */
export const vueuseCore: PackagePreset = {
  package: '@vueuse/core',
  ignore: ['toRefs', 'utils', 'toRef', 'toValue', /^[a-z]{1,3}$/],
}
