import { ref } from 'vue'

type SetStateAction<T> = T | ((prevState: T) => T)
type Dispatch<A> = (value: A) => void

/**
 * Simulates React's useState using Vue's ref.
 *
 * Returns a tuple of [state, setState] where state can be accessed
 * directly without .value (React-style) and setState supports both
 * direct values and functional updates.
 */
export function useState<T>(
  initialState: T | (() => T),
): [T & { value: T }, Dispatch<SetStateAction<T>>] {
  const state = ref(
    typeof initialState === 'function'
      ? (initialState as () => T)()
      : initialState,
  )

  const setState: Dispatch<SetStateAction<T>> = (action) => {
    state.value =
      typeof action === 'function'
        ? (action as (prev: T) => T)(state.value)
        : action
  }

  const stateProxy = new Proxy(state, {
    get(target, prop: string | symbol) {
      const val = target.value
      // Explicit .value access
      if (prop === 'value') return val
      // Primitive coercion (state + 1, Number(state), String(state))
      if (prop === 'valueOf') return () => val
      if (prop === Symbol.toPrimitive)
        return (hint: string) => {
          if (hint === 'number') return Number(val)
          if (hint === 'string') return String(val)
          return val
        }
      if (prop === 'toString') return () => String(val)
      // Object property access (state.count, state.name)
      if (typeof val === 'object' && val !== null && prop in val) {
        return Reflect.get(val, prop)
      }
      return Reflect.get(target, prop)
    },
    set(target, prop: string | symbol, value: unknown) {
      if (prop === 'value') {
        target.value = value as T
        return true
      }
      const val = target.value
      if (typeof val === 'object' && val !== null && prop in val) {
        ; (val as Record<string | symbol, unknown>)[prop] = value
        return true
      }
      return Reflect.set(target, prop, value)
    },
  })

  return [stateProxy as T & { value: T }, setState]
}
