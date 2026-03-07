import {
  watch,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  type WatchSource,
} from 'vue'

type EffectCallback = () => void | (() => void)
type DependencyList = WatchSource[]

/**
 * Simulates React's useEffect using Vue's watch/watchEffect.
 *
 * - No deps: re-runs whenever any accessed reactive dependency changes (watchEffect)
 * - Empty deps []: runs once on mount, cleanup on unmount
 * - With deps: re-runs when any dep changes, with immediate first execution
 *
 * The effect can return a cleanup function, just like React's useEffect.
 */
export function useEffect(effect: EffectCallback, deps?: DependencyList): void {
  if (deps === undefined) {
    watchEffect((onCleanup) => {
      const cleanup = effect()
      if (typeof cleanup === 'function') {
        onCleanup(cleanup)
      }
    })
    return
  }

  if (deps.length === 0) {
    let cleanup: void | (() => void)
    onMounted(() => {
      cleanup = effect()
    })
    onBeforeUnmount(() => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    return
  }

  watch(
    deps,
    (_newValues, _oldValues, onCleanup) => {
      const cleanupFn = effect()
      if (typeof cleanupFn === 'function') {
        onCleanup(cleanupFn)
      }
    },
    { immediate: true },
  )
}
