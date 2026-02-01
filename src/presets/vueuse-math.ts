import type { PackagePreset } from 'unimport'

/** Requires `@vueuse/math` to be installed */
export const vueuseMath: PackagePreset = {
  package: '@vueuse/math',
  ignore: [/^[a-z]{1,3}$/],
}
