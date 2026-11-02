import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { enviar } from '../api'
import { IconoAlerta, IconoCheck, IconoEspera } from '../componentes/Iconos'
import { fechaLarga, hora, precio } from '../formato'
import { useApi } from '../useApi'
import type { Turno } from '../tipos'
import NoEncontrado from './NoEncontrado'

export default function EstadoTurno() {
  const { codigo } = useParams()
  const { datos, cargando, error, setDatos } = useApi<{ turno: Turno; sePuedeCancelar: boolean }>(`/api/Turnos/${codigo}`)
  const [confirmando, setConfirmando] = useState(false)
  const [errorCancelar, setErrorCancelar] = useState('')

  if (cargando) return <div className="cargando"><div className="giro" /></div>
  if (error || !datos) return <NoEncontrado />
  const { turno, sePuedeCancelar } = datos

  async function cancelar() {
    try {
      await enviar(`/api/Turnos/${codigo}/cancelar`, 'POST')
      setDatos({ turno: { ...turno, estado: 'Cancelado' }, sePuedeCancelar: false })
    } catch (e) {
      setErrorCancelar((e as Error).message)
    }
  }

  return (
    <div className="contenedor">
      <div className="tarjeta-estado">
        {turno.estado === 'Confirmado' && <><div className="icono-estado"><IconoCheck /></div><h1>Turno confirmado</h1><p className="texto-2">Te esperamos, {turno.cliente.nombre}. Llegá 5 minutos antes así arrancamos tranquilas.</p></>}
        {turno.estado === 'PendientePago' && <><div className="icono-estado espera"><IconoEspera /></div><h1>Falta la seña</h1><p className="texto-2">Guardamos el horario 15 minutos desde que reservaste. Si no se completa el pago, se libera.</p></>}
        {turno.estado === 'Cancelado' && <><div className="icono-estado mal"><IconoAlerta /></div><h1>Turno cancelado</h1><p className="texto-2">Si habías pagado la seña, queda a favor para tu próximo turno.</p></>}
        {(turno.estado === 'Completado' || turno.estado === 'Ausente') && <><div className="icono-estado"><IconoCheck /></div><h1>Turno cerrado</h1></>}

        <dl className="lista-datos">
          <div><dt>Tratamiento</dt><dd>{turno.tratamiento.nombre}</dd></div>
          <div><dt>Día</dt><dd>{fechaLarga(turno.fechaHora)}</dd></div>
          <div><dt>Horario</dt><dd>{hora(turno.fechaHora)} hs</dd></div>
          <div><dt>Profesional</dt><dd>{turno.profesional.nombre}</dd></div>
          <div><dt>Pagado</dt><dd>{precio(turno.totalPagado)}</dd></div>
          <div><dt>Resto en el estudio</dt><dd>{precio(Math.max(0, turno.precio - turno.totalPagado))}</dd></div>
        </dl>

        {errorCancelar && <p className="mensaje-error">{errorCancelar}</p>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {sePuedeCancelar && !confirmando && <button className="boton boton-claro" onClick={() => setConfirmando(true)}>Cancelar turno</button>}
          {confirmando && turno.estado !== 'Cancelado' && (
            <>
              <button className="boton" onClick={cancelar}>Sí, cancelar el turno</button>
              <button className="boton boton-claro" onClick={() => setConfirmando(false)}>Mantener el turno</button>
            </>
          )}
          {turno.estado === 'Cancelado' && <Link to="/reservar" className="boton">Reservar otro turno</Link>}
          {turno.estado === 'PendientePago' && (
            <button className="boton" onClick={() => enviar<{ url: string }>(`/api/Pagos/turno/${codigo}`, 'POST').then((p) => (window.location.href = p.url)).catch((e: Error) => setErrorCancelar(e.message))}>
              Pagar la seña de {precio(turno.sena)}
            </button>
          )}
        </div>
        {!sePuedeCancelar && turno.estado === 'Confirmado' && <p className="texto-2" style={{ fontSize: 'var(--t-s)' }}>Faltan menos de 24 horas: para cambios, escribinos por WhatsApp.</p>}
      </div>
    </div>
  )
}
