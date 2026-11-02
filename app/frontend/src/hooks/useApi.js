import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'

// โหลดข้อมูลจาก api() พร้อมสถานะ loading / error — ส่ง path เป็น null เพื่อยังไม่โหลด
export function useApi(path) {
  const [nonce, setNonce] = useState(0)
  const key = `${path}#${nonce}`
  const [state, setState] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    if (!path) return
    let cancelled = false
    api(path)
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch((error) => !cancelled && setState({ key, data: null, error }))
    return () => {
      cancelled = true
    }
  }, [path, key])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const loading = Boolean(path) && state.key !== key
  return { data: loading ? null : state.data, error: loading ? null : state.error, loading, reload }
}
