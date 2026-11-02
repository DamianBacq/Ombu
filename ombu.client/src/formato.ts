const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export function precio(valor: number): string {
  return pesos.format(valor)
}

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// La API manda fechas sin zona ("2026-11-03T16:00:00"): se leen tal cual, en hora argentina
export function leerFecha(texto: string): Date {
  const [fecha, hora = '00:00'] = texto.split('T')
  const [a, m, d] = fecha.split('-').map(Number)
  const [h, min] = hora.split(':').map(Number)
  return new Date(a, m - 1, d, h, min)
}

// Fecha yyyy-MM-dd armada a mano (nunca con toISOString, que pasa a UTC)
export function fechaISO(fecha: Date): string {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}

export function fechaLarga(texto: string): string {
  const f = leerFecha(texto)
  const resultado = `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`
  return resultado.charAt(0).toUpperCase() + resultado.slice(1)
}

export function hora(texto: string): string {
  return texto.split('T')[1].substring(0, 5)
}

export function fechaCorta(texto: string): string {
  const f = leerFecha(texto)
  return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}`
}
