import type { InlinePreset } from 'unimport'

export const recoil: InlinePreset = {
  from: 'recoil',
  imports: [
    'atom',
    'selector',
    'useRecoilState',
    'useRecoilValue',
    'useSetRecoilState',
    'useResetRecoilState',
    'useRecoilStateLoadable',
    'useRecoilValueLoadable',
    'isRecoilValue',
    'useRecoilCallback',
  ],
}
