import { useState, type FormEvent } from 'react'
import { enviar } from '../api'
import { DIAS } from '../formato'
import type { HorarioAtencion } from '../tipos'

// Agrupa los horarios por día: "09:00 a 19:00" o "Cerrado"
function horarioDelDia(horarios: HorarioAtencion[], dia: number) {
  const franjas = horarios.filter((h) => h.diaSemana === dia)
  if (franjas.length === 0) return 'Cerrado'
  return franjas.map((f) => `${f.horaDesde.substring(0, 5)} a ${f.horaHasta.substring(0, 5)}`).join(' y ')
}

export default function Contacto({ horarios }: { horarios: HorarioAtencion[] }) {
  const [datos, setDatos] = useState({ nombre: '', email: '', mensaje: '' })
  const [estado, setEstado] = useState<'' | 'enviando' | 'enviado'>('')
  const [error, setError] = useState('')
  const hoy = new Date().getDay()

  async function alEnviar(e: FormEvent) {
    e.preventDefault()
    setEstado('enviando')
    setError('')
    try {
      await enviar('/api/Consultas', 'POST', datos)
      setEstado('enviado')
      setDatos({ nombre: '', email: '', mensaje: '' })
    } catch (err) {
      setError((err as Error).message)
      setEstado('')
    }
  }

  return (
    <section className="seccion" id="contacto">
      <div className="contenedor contacto">
        <div>
          <h2>Visitanos</h2>
          <p className="texto-2">Calle Ejemplo 1234, Lomas de Zamora. A pocas cuadras de la estación, con estacionamiento en la puerta.</p>
          <table className="tabla-horarios">
            <tbody>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <tr key={d} className={d === hoy ? 'hoy' : ''}>
                  <td>{DIAS[d].charAt(0).toUpperCase() + DIAS[d].slice(1)}{d === hoy ? ' (hoy)' : ''}</td>
                  <td>{horarioDelDia(horarios, d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <iframe
            className="mapa"
            title="Mapa del estudio"
            loading="lazy"
            src="https://www.google.com/maps?q=Lomas+de+Zamora,+Buenos+Aires&z=14&output=embed"
          />
        </div>
        <div>
          <h2>Escribinos</h2>
          <p className="texto-2" style={{ marginBottom: 28 }}>¿No sabés qué tratamiento elegir o qué producto va con tu piel? Contanos y te respondemos en el día.</p>
          <form className="formulario" onSubmit={alEnviar}>
            <div className="campos-2">
              <div className="campo">
                <label htmlFor="c-nombre">Nombre</label>
                <input id="c-nombre" required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} autoComplete="given-name" />
              </div>
              <div className="campo">
                <label htmlFor="c-email">Mail</label>
                <input id="c-email" type="email" required value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} autoComplete="email" />
              </div>
            </div>
            <div className="campo">
              <label htmlFor="c-mensaje">Mensaje</label>
              <textarea id="c-mensaje" required maxLength={1000} value={datos.mensaje} onChange={(e) => setDatos({ ...datos, mensaje: e.target.value })} />
            </div>
            {error && <p className="mensaje-error">{error}</p>}
            {estado === 'enviado' && <p className="mensaje-ok">Recibimos tu mensaje. Te respondemos por mail en el día.</p>}
            <div>
              <button className="boton" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
