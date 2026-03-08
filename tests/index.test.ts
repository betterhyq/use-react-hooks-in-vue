import { describe, expect, it, vi } from 'vitest'
import { ref, nextTick, reactive } from 'vue'
import { useState, useRef, useEffect, useMemo, useCallback } from '../src'

describe('useState', () => {
  it('should initialize with a direct value (no .value needed)', () => {
    const [state, _setState] = useState(0)
    expect(Number(state)).toBe(0)
    expect(state.value).toBe(0)
  })

  it('should initialize with a function (lazy init)', () => {
    const [state] = useState(() => 42)
    expect(Number(state)).toBe(42)
  })

  it('should update state with a direct value', () => {
    const [state, setState] = useState(0)
    setState(5)
    expect(state + 0).toBe(5)
  })

  it('should update state with a functional update', () => {
    const [state, setState] = useState(10)
    setState((prev) => prev + 5)
    expect(state + 0).toBe(15)
  })

  it('should handle multiple updates', () => {
    const [state, setState] = useState(0)
    setState((prev) => prev + 1)
    setState((prev) => prev + 1)
    setState((prev) => prev + 1)
    expect(state + 0).toBe(3)
  })

  it('should work with object state (direct access without .value)', () => {
    const [state, setState] = useState({ count: 0, name: 'test' })
    setState({ count: 1, name: 'updated' })
    expect(state.count).toBe(1)
    expect(state.name).toBe('updated')
    expect(state.value).toEqual({ count: 1, name: 'updated' })
  })

  it('should work with string state', () => {
    const [state, setState] = useState('hello')
    setState('world')
    expect(String(state)).toBe('world')
  })

  it('should work with primitive coercion (state + 1, no .value needed)', () => {
    const [state, setState] = useState(10)
    expect(state + 5).toBe(15)
    setState(20)
    expect(Number(state)).toBe(20)
    expect(String(state)).toBe('20')
  })
})

describe('useRef', () => {
  it('should initialize with a value', () => {
    const myRef = useRef(0)
    expect(myRef.current).toBe(0)
  })

  it('should initialize without a value', () => {
    const myRef = useRef()
    expect(myRef.current).toBeUndefined()
  })

  it('should allow mutation of .current', () => {
    const myRef = useRef(0)
    myRef.current = 42
    expect(myRef.current).toBe(42)
  })

  it('should hold object references', () => {
    const obj = { a: 1 }
    const myRef = useRef(obj)
    expect(myRef.current).toBe(obj)

    const newObj = { a: 2 }
    myRef.current = newObj
    expect(myRef.current).toBe(newObj)
  })

  it('should preserve identity across reads', () => {
    const myRef = useRef('stable')
    const first = myRef
    myRef.current = 'changed'
    expect(first.current).toBe('changed')
  })
})

describe('useMemo', () => {
  it('should compute the initial value', () => {
    const result = useMemo(() => 2 + 3, [])
    expect(result.value).toBe(5)
  })

  it('should not recompute when deps is empty', async () => {
    let callCount = 0
    const result = useMemo(() => {
      callCount++
      return 'computed'
    }, [])
    expect(result.value).toBe('computed')
    expect(callCount).toBe(1)

    await nextTick()
    expect(callCount).toBe(1)
  })

  it('should recompute when deps change', async () => {
    const dep = ref(1)
    let callCount = 0
    const result = useMemo(() => {
      callCount++
      return dep.value * 2
    }, [dep])

    expect(result.value).toBe(2)
    expect(callCount).toBe(1)

    dep.value = 5
    await nextTick()
    expect(result.value).toBe(10)
    expect(callCount).toBe(2)
  })

  it('should work with multiple deps', async () => {
    const a = ref(1)
    const b = ref(2)
    const result = useMemo(() => a.value + b.value, [a, b])

    expect(result.value).toBe(3)

    a.value = 10
    await nextTick()
    expect(result.value).toBe(12)

    b.value = 20
    await nextTick()
    expect(result.value).toBe(30)
  })

  it('should work with getter deps', async () => {
    const state = reactive({ count: 0 })
    const result = useMemo(() => state.count * 3, [() => state.count])

    expect(result.value).toBe(0)

    state.count = 4
    await nextTick()
    expect(result.value).toBe(12)
  })
})

describe('useCallback', () => {
  it('should return a callable function (no .value needed)', () => {
    const fn = () => 'hello'
    const memoized = useCallback(fn, [])
    expect(memoized()).toBe('hello')
  })

  it('should update when deps change', async () => {
    const dep = ref(0)
    const memoized = useCallback(() => dep.value * 2, [dep])

    expect(memoized()).toBe(0)

    dep.value = 5
    await nextTick()
    expect(memoized()).toBe(10)
  })

  it('should preserve returned function reference when deps do not change', async () => {
    const dep = ref(0)
    const memoized = useCallback(() => dep.value, [dep])

    const firstRef = memoized
    await nextTick()
    expect(memoized).toBe(firstRef)
  })
})

describe('useEffect', () => {
  it('should run effect immediately with deps (immediate watch)', () => {
    const dep = ref(0)
    const fn = vi.fn()

    useEffect(() => {
      fn(dep.value)
    }, [dep])

    expect(fn).toHaveBeenCalledWith(0)
  })

  it('should re-run effect when deps change', async () => {
    const dep = ref(0)
    const fn = vi.fn()

    useEffect(() => {
      fn(dep.value)
    }, [dep])

    dep.value = 1
    await nextTick()
    expect(fn).toHaveBeenCalledWith(1)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should call cleanup when deps change', async () => {
    const dep = ref(0)
    const cleanup = vi.fn()

    useEffect(() => {
      return cleanup
    }, [dep])

    expect(cleanup).not.toHaveBeenCalled()

    dep.value = 1
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should run effect on every reactive change without deps (watchEffect)', async () => {
    const count = ref(0)
    const fn = vi.fn()

    useEffect(() => {
      fn(count.value)
    })

    expect(fn).toHaveBeenCalledWith(0)

    count.value = 1
    await nextTick()
    expect(fn).toHaveBeenCalledWith(1)

    count.value = 2
    await nextTick()
    expect(fn).toHaveBeenCalledWith(2)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should handle cleanup with watchEffect (no deps)', async () => {
    const count = ref(0)
    const cleanup = vi.fn()

    useEffect(() => {
      void count.value
      return cleanup
    })

    count.value = 1
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should work with multiple deps', async () => {
    const a = ref(0)
    const b = ref(0)
    const fn = vi.fn()

    useEffect(() => {
      fn(a.value, b.value)
    }, [a, b])

    expect(fn).toHaveBeenCalledTimes(1)

    a.value = 1
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(2)

    b.value = 1
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
