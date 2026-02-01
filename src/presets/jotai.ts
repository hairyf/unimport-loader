import type { InlinePreset } from 'unimport'

export const jotai: InlinePreset = {
  from: 'jotai',
  imports: [
    'atom',
    'useAtom',
    'useAtomValue',
    'useSetAtom',
  ],
}

export const jotaiUtils: InlinePreset = {
  from: 'jotai/utils',
  imports: [
    'atomWithReset',
    'useResetAtom',
    'useReducerAtom',
    'atomWithReducer',
    'atomFamily',
    'selectAtom',
    'useAtomCallback',
    'freezeAtom',
    'freezeAtomCreator',
    'splitAtom',
    'atomWithDefault',
    'waitForAll',
    'atomWithStorage',
    'atomWithHash',
    'createJSONStorage',
    'atomWithObservable',
    'useHydrateAtoms',
    'loadable',
  ],
}
