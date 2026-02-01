import type { InlinePreset } from 'unimport'

export const mobx: InlinePreset = {
  from: 'mobx',
  imports: [
    'makeObservable',
    'makeAutoObservable',
    'extendObservable',
    'observable',
    'action',
    'runInAction',
    'flow',
    'flowResult',
    'computed',
    'autorun',
    'reaction',
    'when',
    'onReactionError',
    'intercept',
    'observe',
    'onBecomeObserved',
    'onBecomeUnobserved',
    'toJS',
  ],
}
