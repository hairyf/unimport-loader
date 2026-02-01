import type { InlinePreset } from 'unimport'

export const svelte: InlinePreset = {
  from: 'svelte',
  imports: [
    'onMount',
    'beforeUpdate',
    'afterUpdate',
    'onDestroy',
    'tick',
    'setContext',
    'getContext',
    'hasContext',
    'getAllContexts',
    'createEventDispatcher',
  ],
}

export const svelteAnimate: InlinePreset = {
  from: 'svelte/animate',
  imports: ['flip'],
}

export const svelteEasing: InlinePreset = {
  from: 'svelte/easing',
  imports: [
    'linear',
    'backIn',
    'backOut',
    'backInOut',
    'bounceIn',
    'bounceOut',
    'bounceInOut',
    'circIn',
    'circOut',
    'circInOut',
    'cubicIn',
    'cubicOut',
    'cubicInOut',
    'elasticIn',
    'elasticOut',
    'elasticInOut',
    'expoIn',
    'expoOut',
    'expoInOut',
    'quadIn',
    'quadOut',
    'quadInOut',
    'quartIn',
    'quartOut',
    'quartInOut',
    'quintIn',
    'quintOut',
    'quintInOut',
    'sineIn',
    'sineOut',
    'sineInOut',
  ],
}

export const svelteStore: InlinePreset = {
  from: 'svelte/store',
  imports: ['writable', 'readable', 'derived', 'get'],
}

export const svelteMotion: InlinePreset = {
  from: 'svelte/motion',
  imports: ['tweened', 'spring'],
}

export const svelteTransition: InlinePreset = {
  from: 'svelte/transition',
  imports: [
    'fade',
    'blur',
    'fly',
    'slide',
    'scale',
    'draw',
    'crossfade',
  ],
}
