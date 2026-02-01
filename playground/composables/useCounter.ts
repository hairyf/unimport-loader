'use client'

import { useCallback, useState } from 'react'

/**
 * 测试 dirs 自动导入：从 composables 目录扫描得到的 hook
 */
export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const inc = useCallback(() => setCount(c => c + 1), [])
  const dec = useCallback(() => setCount(c => c - 1), [])
  return { count, setCount, inc, dec }
}
