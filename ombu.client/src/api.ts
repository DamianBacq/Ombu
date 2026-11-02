// Llamadas a la API. Si la respuesta no es OK, lanza un Error con el mensaje del servidor.
export async function api<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const token = leerToken()
  const respuesta = await fetch(url, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token && url.startsWith('/api/Panel') ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  if (respuesta.status === 401 && url.startsWith('/api/Panel')) {
    guardarToken(null)
    window.location.href = '/panel/login'
  }
  const texto = await respuesta.text()
  if (!respuesta.ok) {
    throw new Error(texto && texto.length < 300 ? texto.replace(/^"|"$/g, '') : 'No pudimos conectar con el servidor. Probá de nuevo en un momento.')
  }
  return (texto ? JSON.parse(texto) : null) as T
}

export function enviar<T>(url: string, metodo: string, datos?: unknown): Promise<T> {
  return api<T>(url, { method: metodo, body: datos === undefined ? undefined : JSON.stringify(datos) })
}

export function leerToken(): string | null {
  try {
    return localStorage.getItem('ombu-token')
  } catch {
    return null
  }
}

export function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem('ombu-token', token)
    else localStorage.removeItem('ombu-token')
  } catch {
    // sin almacenamiento: el login dura lo que dure la pestaña
  }
}
