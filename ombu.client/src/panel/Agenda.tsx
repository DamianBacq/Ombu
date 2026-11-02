import { useState } from 'react'
import { enviar } from '../api'
import { IconoCerrar } from '../componentes/Iconos'
import { DIAS, MESES, fechaISO, fechaLarga, hora, leerFecha, precio } from '../formato'
import { useApi } from '../useApi'
import type { Turno } from '../tipos'

const NOMBRE_ESTADO: Record<Turno['estado'], string> = {
  PendientePago: 'Esperando seña', Confirmado: 'Confirmado', Cancelado: 'Cancelado', Completado: 'Cobrado', Ausente: 'Ausente',
}

// Lunes de la semana de una fecha
function lunes(fecha: Date) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export default function Agenda() {
  const [desde, setDesde] = useState(lunes(new Date()))
  const { datos, cargando, setDatos } = useApi<Turno[]>(`/api/Panel/turnos?desde=${fechaISO(desde)}`)
  const [elegido, setElegido] = useState<Turno | null>(null)
  const [error, setError] = useState('')

  const dias = [0, 1, 2, 3, 4, 5].map((i) => new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i))
  const hoy = new Date().toDateString()
  const moverSemana = (semanas: number) => setDesde(new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + semanas * 7))

  async function accion(turno: Turno, nombre: 'Cobrar' | 'Ausente' | 'Cancelar') {
    setError('')
    try {
      await enviar(`/api/Panel/turnos/${turno.id}/${nombre}`, 'PUT')
      const estado = nombre === 'Cobrar' ? 'Completado' : nombre === 'Ausente' ? 'Ausente' : 'Cancelado'
      const totalPagado = nombre === 'Cobrar' ? turno.precio : turno.totalPagado
      setDatos((datos ?? []).map((t) => (t.id === turno.id ? { ...t, estado, totalPagado } : t)))
      setElegido(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Agenda</h1>
          <p>Semana del {desde.getDate()} de {MESES[desde.getMonth()]}. Tocá un turno para cobrarlo o marcar ausente.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="boton boton-claro boton-chico" onClick={() => moverSemana(-1)}>Semana anterior</button>
          <button className="boton boton-claro boton-chico" onClick={() => setDesde(lunes(new Date()))}>Hoy</button>
          <button className="boton boton-claro boton-chico" onClick={() => moverSemana(1)}>Semana siguiente</button>
        </div>
      </div>

      {cargando ? (
        <div className="cargando"><div className="giro" /></div>
      ) : (
        <div className="agenda-semana">
          {dias.map((d) => {
            const turnos = (datos ?? []).filter((t) => leerFecha(t.fechaHora).toDateString() === d.toDateString())
            return (
              <section key={d.toDateString()} className={`dia-agenda ${d.toDateString() === hoy ? 'hoy' : ''}`}>
                <h3>{DIAS[d.getDay()]} {d.getDate()}</h3>
                {turnos.length === 0 && <p className="vacio-dia">Sin turnos</p>}
                {turnos.map((t) => (
                  <button key={t.id} className={`turno-agenda ${t.estado} ${t.tratamiento.tipo}`} onClick={() => setElegido(t)}>
                    <span>{hora(t.fechaHora)} · {t.profesional.nombre.split(' ')[0]}</span>
                    <strong>{t.cliente.nombre} {t.cliente.apellido}</strong>
                    <span>{t.tratamiento.nombre}</span>
                    <span><span className={`estado ${t.estado}`}>{NOMBRE_ESTADO[t.estado]}</span></span>
                  </button>
                ))}
              </section>
            )
          })}
        </div>
      )}

      {elegido && (
        <>
          <div className="fondo-oscuro" onClick={() => setElegido(null)} />
          <aside className="panel-lateral" role="dialog" aria-modal="true" aria-label="Turno">
            <header>
              <h2>{elegido.cliente.nombre} {elegido.cliente.apellido}</h2>
              <button className="boton-icono" onClick={() => setElegido(null)} aria-label="Cerrar" autoFocus><IconoCerrar /></button>
            </header>
            <div className="cuerpo">
              <dl className="lista-datos" style={{ marginTop: 12 }}>
                <div><dt>Estado</dt><dd><span className={`estado ${elegido.estado}`}>{NOMBRE_ESTADO[elegido.estado]}</span></dd></div>
                <div><dt>Tratamiento</dt><dd>{elegido.tratamiento.nombre}</dd></div>
                <div><dt>Día</dt><dd>{fechaLarga(elegido.fechaHora)}, {hora(elegido.fechaHora)} hs</dd></div>
                <div><dt>Profesional</dt><dd>{elegido.profesional.nombre}</dd></div>
                <div><dt>Teléfono</dt><dd><a href={`https://wa.me/549${elegido.cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{elegido.cliente.telefono}</a></dd></div>
                <div><dt>Mail</dt><dd>{elegido.cliente.email}</dd></div>
                <div><dt>Precio</dt><dd>{precio(elegido.precio)}</dd></div>
                <div><dt>Pagado</dt><dd>{precio(elegido.totalPagado)}</dd></div>
                <div><dt>Falta cobrar</dt><dd>{precio(Math.max(0, elegido.precio - elegido.totalPagado))}</dd></div>
              </dl>
              {error && <p className="mensaje-error" style={{ marginTop: 16 }}>{error}</p>}
            </div>
            {(elegido.estado === 'Confirmado' || elegido.estado === 'PendientePago') && (
              <footer>
                <button className="boton boton-ancho" onClick={() => accion(elegido, 'Cobrar')}>
                  Cobrar {precio(Math.max(0, elegido.precio - elegido.totalPagado))} y cerrar
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="boton boton-claro" style={{ flex: 1 }} onClick={() => accion(elegido, 'Ausente')}>No vino</button>
                  <button className="boton boton-claro" style={{ flex: 1 }} onClick={() => accion(elegido, 'Cancelar')}>Cancelar turno</button>
                </div>
              </footer>
            )}
          </aside>
        </>
      )}
    </>
  )
}
