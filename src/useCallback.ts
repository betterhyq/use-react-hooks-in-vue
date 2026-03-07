import type { WatchSource } from 'vue'
import { useMemo } from './useMemo'

type DependencyList = WatchSource[]

/**
 * Simulates React's useCallback using useMemo.
 *
 * Returns a stable function that invokes the memoized callback.
 * Call directly: fn() — no need to use .value.
 * The inner callback updates only when dependencies change.
 */
export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
): T {
  const ref = useMemo(() => callback, deps)
  return ((...args: Parameters<T>): ReturnType<T> => {
    return ref.value(...args)
  }) as T
}
