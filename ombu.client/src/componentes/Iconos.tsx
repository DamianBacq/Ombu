// Íconos de trazo simple, heredan el color del texto
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const IconoBolsa = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
export const IconoMenu = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M4 8h16M4 16h16" /></svg>
)
export const IconoCerrar = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const IconoMas = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconoBuscar = () => (
  <svg viewBox="0 0 24 24" {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
)
export const IconoUbicacion = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const IconoReloj = () => (
  <svg viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
)
export const IconoCamion = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
)
export const IconoCheck = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2.2}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const IconoEspera = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
)
export const IconoAlerta = () => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2.2}><path d="M12 7v6M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
)
export const IconoFlecha = () => (
  <svg viewBox="0 0 24 24" {...base} width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconoWhatsapp = () => (
  <svg viewBox="0 0 24 24" {...base}><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 9.5Z" /></svg>
)
