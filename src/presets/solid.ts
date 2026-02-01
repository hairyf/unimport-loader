import type { InlinePreset } from 'unimport'

export const solidCore: InlinePreset = {
  from: 'solid-js',
  imports: [
    'createSignal',
    'createEffect',
    'createMemo',
    'createResource',
    'onMount',
    'onCleanup',
    'onError',
    'untrack',
    'batch',
    'on',
    'createRoot',
    'mergeProps',
    'splitProps',
    'useTransition',
    'observable',
    'mapArray',
    'indexArray',
    'createContext',
    'useContext',
    'children',
    'lazy',
    'createDeferred',
    'createRenderEffect',
    'createSelector',
    'For',
    'Show',
    'Switch',
    'Match',
    'Index',
    'ErrorBoundary',
    'Suspense',
    'SuspenseList',
  ],
}

export const solidStore: InlinePreset = {
  from: 'solid-js/store',
  imports: [
    'createStore',
    'produce',
    'reconcile',
    'createMutable',
  ],
}

export const solidWeb: InlinePreset = {
  from: 'solid-js/web',
  imports: [
    'Dynamic',
    'hydrate',
    'render',
    'renderToString',
    'renderToStringAsync',
    'renderToStream',
    'isServer',
    'Portal',
  ],
}
