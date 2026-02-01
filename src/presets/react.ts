import type { InlinePreset } from 'unimport'

const commonReactAPI = [
  'useState',
  'useCallback',
  'useMemo',
  'useEffect',
  'useRef',
  'useContext',
  'useReducer',
  'useImperativeHandle',
  'useDebugValue',
  'useDeferredValue',
  'useLayoutEffect',
  'useTransition',
  'startTransition',
  'useSyncExternalStore',
  'useInsertionEffect',
  'useId',
  'lazy',
  'memo',
  'createRef',
  'forwardRef',
]

export const react: InlinePreset = {
  from: 'react',
  imports: [
    ...commonReactAPI,
    'cache',
    'cacheSignal',
    'createContext',
    'use',
    'useOptimistic',
    'useEffectEvent',
    'useActionState',
    'Fragment',
    'Suspense',
    'Activity',
  ],
}
