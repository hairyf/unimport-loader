import type { PackagePreset } from 'unimport'

/** Requires `ahooks` to be installed */
export const ahooks: PackagePreset = {
  package: 'ahooks',
  ignore: [/^[A-Z]/, name => name.length < 4],
}
