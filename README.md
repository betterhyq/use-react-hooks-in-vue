# use-react

React-like hooks implemented with Vue 3 Composition API.

Provides `useState`, `useRef`, `useEffect`, `useMemo`, and `useCallback` — familiar React hook APIs powered by Vue 3 reactivity primitives.

## Install

```bash
npm install use-react
```

> Requires `vue >= 3.5` as a peer dependency.

## Usage

### `useState`

Manages reactive state with a `[state, setState]` tuple. Supports direct values and functional updates.

```ts
import { useState } from 'use-react'

const [count, setCount] = useState(0)

setCount(5)
setCount(prev => prev + 1)

// Lazy initialization
const [data, setData] = useState(() => expensiveComputation())
```

### `useRef`

Holds a mutable `.current` value. The object is shallowly reactive — assigning to `.current` is tracked by Vue, but the stored value itself is not deeply converted, preserving object identity.

```ts
import { useRef } from 'use-react'

const countRef = useRef(0)
countRef.current = 42

const nodeRef = useRef<HTMLDivElement>()
// <div ref="nodeRef.current" />
```

### `useEffect`

Runs side effects with dependency tracking. Supports cleanup functions.

```ts
import { useEffect } from 'use-react'
import { ref } from 'vue'

const count = ref(0)

// Runs on every reactive dependency change (like watchEffect)
useEffect(() => {
  console.log('count changed:', count.value)
})

// Runs once on mount, cleanup on unmount
useEffect(() => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer)
}, [])

// Runs when specific deps change
useEffect(() => {
  document.title = `Count: ${count.value}`
  return () => { document.title = 'App' }
}, [count])
```

**Dependency behavior:**

| `deps`      | Behavior                                             | Vue equivalent                  |
| ----------- | ---------------------------------------------------- | ------------------------------- |
| `undefined` | Re-runs on every accessed reactive dependency change | `watchEffect`                   |
| `[]`        | Runs once on mount, cleanup on unmount               | `onMounted` + `onBeforeUnmount` |
| `[a, b]`    | Re-runs when any dep changes (immediate first run)   | `watch(deps, fn, {immediate})`  |

### `useMemo`

Returns a memoized value (`Ref<T>`) that recomputes only when dependencies change.

```ts
import { useMemo } from 'use-react'
import { ref } from 'vue'

const list = ref([3, 1, 2])

const sorted = useMemo(() => [...list.value].sort(), [list])
console.log(sorted.value) // [1, 2, 3]
```

### `useCallback`

Returns a memoized callback (`Ref<T>`) that updates only when dependencies change. Equivalent to `useMemo(() => fn, deps)`.

```ts
import { useCallback } from 'use-react'
import { ref } from 'vue'

const count = ref(0)

const increment = useCallback(() => {
  count.value++
}, [])

increment.value() // invoke via .value
```

## Deps Type

The `deps` array accepts Vue `WatchSource` items — `Ref`, `ComputedRef`, or getter functions:

```ts
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({ name: 'hello' })

useEffect(() => { /* ... */ }, [count])             // Ref
useEffect(() => { /* ... */ }, [() => state.name])  // Getter
```

## Development

```bash
pnpm install     # Install dependencies
pnpm test        # Run tests
pnpm build       # Build the library
pnpm typecheck   # Type check
```

## License

MIT
