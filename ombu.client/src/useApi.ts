import { useEffect, useState } from 'react'
import { api } from './api'

// Trae datos de la API al montar la página (y cuando cambia la URL)
export function useApi<T>(url: string | null) {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!url) return
    let vigente = true
    setCargando(true)
    api<T>(url)
      .then((d) => vigente && (setDatos(d), setError('')))
      .catch((e: Error) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [url])

  return { datos, error, cargando, setDatos }
}
