import type { InlinePreset } from 'unimport'

export const preact: InlinePreset = {
  from: 'preact/hooks',
  imports: [
    'useState',
    'useCallback',
    'useMemo',
    'useEffect',
    'useRef',
    'useContext',
    'useReducer',
  ],
}
