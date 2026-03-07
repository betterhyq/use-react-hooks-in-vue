import { shallowRef, watch, type Ref, type WatchSource } from 'vue'

type DependencyList = WatchSource[]

/**
 * Simulates React's useMemo using Vue's shallowRef + watch.
 *
 * Returns a readonly Ref that recomputes when any dependency changes.
 * If deps is empty, the value is computed once and never updated.
 */
export function useMemo<T>(
  factory: () => T,
  deps: DependencyList,
): Readonly<Ref<T>> {
  const result = shallowRef(factory()) as Ref<T>

  if (deps.length > 0) {
    watch(deps, () => {
      result.value = factory()
    })
  }

  return result
}
