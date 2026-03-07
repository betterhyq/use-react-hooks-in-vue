import { type Ref, type WatchSource } from 'vue'
import { useMemo } from './useMemo'

type DependencyList = WatchSource[]

/**
 * Simulates React's useCallback using useMemo.
 *
 * Returns a readonly Ref holding the memoized callback.
 * The callback reference updates only when dependencies change.
 *
 * Equivalent to useMemo(() => callback, deps).
 */
export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
): Readonly<Ref<T>> {
  return useMemo(() => callback, deps)
}
