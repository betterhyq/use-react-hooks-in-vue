import { ref, type Ref } from 'vue'

type SetStateAction<T> = T | ((prevState: T) => T)
type Dispatch<A> = (value: A) => void

/**
 * Simulates React's useState using Vue's ref.
 *
 * Returns a tuple of [state, setState] where state is a Vue Ref
 * and setState supports both direct values and functional updates.
 */
export function useState<T>(
  initialState: T | (() => T),
): [Ref<T>, Dispatch<SetStateAction<T>>] {
  const state = ref(
    typeof initialState === 'function'
      ? (initialState as () => T)()
      : initialState,
  ) as Ref<T>

  const setState: Dispatch<SetStateAction<T>> = (action) => {
    state.value =
      typeof action === 'function'
        ? (action as (prev: T) => T)(state.value)
        : action
  }

  return [state, setState]
}
