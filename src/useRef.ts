import { shallowReactive } from 'vue'

interface MutableRefObject<T> {
  current: T
}

/**
 * Simulates React's useRef using Vue's shallowReactive.
 *
 * Returns a shallowly reactive object with a .current property.
 * Assigning to .current is reactive (tracked by Vue), but the stored
 * value itself is not deeply converted — preserving object identity.
 */
export function useRef<T>(initialValue: T): MutableRefObject<T>
export function useRef<T = undefined>(): MutableRefObject<T | undefined>
export function useRef<T>(initialValue?: T): MutableRefObject<T | undefined> {
  return shallowReactive({ current: initialValue }) as MutableRefObject<
    T | undefined
  >
}
