import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, enviar } from '../api'
import { DIAS, MESES, fechaISO, fechaLarga, precio } from '../formato'
import { useApi } from '../useApi'
import type { Cliente, Profesional, Tratamiento, Turno } from '../tipos'

interface Horario {
  hora: string
  profesionales: number[]
}

const PASOS = ['Tratamiento', 'Día y horario', 'Tus datos', 'Confirmar']
const DIAS_PARA_RESERVAR = 21

export default function Reservar() {
  const [params] = useSearchParams()
  const tratamientos = useApi<Tratamiento[]>('/api/Estudio/tratamientos')
  const profesionales = useApi<Profesional[]>('/api/Estudio/profesionales')
  const diasAtencion = useApi<number[]>('/api/Estudio/dias')

  const [paso, setPaso] = useState(0)
  const [tratamiento, setTratamiento] = useState<Tratamiento | null>(null)
  const [dia, setDia] = useState<Date | null>(null)
  const [horarios, setHorarios] = useState<Horario[] | null>(null)
  const [hora, setHora] = useState('')
  const [profesionalId, setProfesionalId] = useState(0)
  const [cliente, setCliente] = useState<Cliente>({ nombre: '', apellido: '', telefono: '', email: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si viene ?tratamiento=slug, arranca en el paso 2 con ese tratamiento elegido
  useEffect(() => {
    const slug = params.get('tratamiento')
    const encontrado = tratamientos.datos?.find((t) => t.slug === slug)
    if (encontrado) {
      setTratamiento(encontrado)
      setPaso(1)
    }
  }, [tratamientos.datos, params])

  // Los próximos días en los que se puede reservar
  const dias = useMemo(() => {
    const lista: Date[] = []
    const hoy = new Date()
    for (let i = 0; i <= DIAS_PARA_RESERVAR; i++) {
      lista.push(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i))
    }
    return lista
  }, [])

  const atiende = (d: Date) => !diasAtencion.datos || diasAtencion.datos.includes(d.getDay())

  // Elige el primer día que atiende al entrar al paso 2
  useEffect(() => {
    if (paso === 1 && !dia && diasAtencion.datos) {
      setDia(dias.find((d) => diasAtencion.datos!.includes(d.getDay())) ?? null)
    }
  }, [paso, dia, diasAtencion.datos, dias])

  // Carga los horarios libres del día elegido
  useEffect(() => {
    if (!dia || !tratamiento) return
    setHorarios(null)
    setHora('')
    setProfesionalId(0)
    api<Horario[]>(`/api/Turnos/disponibilidad?fecha=${fechaISO(dia)}&tratamientoId=${tratamiento.id}`)
      .then((h) => {
        // Si hoy ya no quedan horarios, pasa solo al próximo día que atiende
        const siguiente = dias.find((d) => d > dia && (!diasAtencion.datos || diasAtencion.datos.includes(d.getDay())))
        if (h.length === 0 && dia.toDateString() === dias[0].toDateString() && siguiente) setDia(siguiente)
        else setHorarios(h)
      })
      .catch((e: Error) => setError(e.message))
  }, [dia, tratamiento, dias, diasAtencion.datos])

  const horarioElegido = horarios?.find((h) => h.hora === hora)
  const nombreProfesional = (id: number) => profesionales.datos?.find((p) => p.id === id)?.nombre ?? ''
  const sena = tratamiento ? Math.round((tratamiento.precio * 0.3) / 100) * 100 : 0

  function irA(nuevo: number) {
    setError('')
    setPaso(nuevo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function alCompletarDatos(e: FormEvent) {
    e.preventDefault()
    irA(3)
  }

  async function confirmar() {
    if (!tratamiento || !dia) return
    setEnviando(true)
    setError('')
    try {
      const turno = await enviar<Turno>('/api/Turnos', 'POST', {
        cliente,
        tratamiento: { id: tratamiento.id },
        profesional: { id: profesionalId },
        fechaHora: `${fechaISO(dia)}T${hora}:00`,
      })
      const pago = await enviar<{ url: string }>(`/api/Pagos/turno/${turno.codigo}`, 'POST')
      window.location.href = pago.url
    } catch (e) {
      setError((e as Error).message)
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor">
      <header className="titulo-pagina">
        <h1>Reservar turno</h1>
      </header>

      <div className="reserva">
        <div>
          <ol className="progreso">
            {PASOS.map((p, i) => (
              <li key={p} className={i < paso ? 'hecho' : i === paso ? 'actual' : ''} aria-current={i === paso ? 'step' : undefined}>
                {p}
              </li>
            ))}
          </ol>

          {paso === 0 && (
            <section className="paso-reserva">
              <h2>¿Qué te querés hacer?</h2>
              {tratamientos.cargando && <div className="esqueleto" style={{ height: 320 }} />}
              <div className="grilla-tratamientos">
                {(tratamientos.datos ?? []).map((t) => (
                  <button
                    key={t.id}
                    className="tarjeta-tratamiento"
                    aria-pressed={tratamiento?.id === t.id}
                    onClick={() => {
                      setTratamiento(t)
                      setDia(null)
                      irA(1)
                    }}
                  >
                    <img src={t.imagen} alt="" loading="lazy" />
                    <div>
                      <strong>{t.nombre}</strong>
                      <span>{t.duracionMinutos} min · {precio(t.precio)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {paso === 1 && tratamiento && (
            <section className="paso-reserva">
              <h2>Elegí día y horario</h2>
              <div className="dias" role="group" aria-label="Día">
                {dias.map((d) => (
                  <button key={d.toDateString()} className="dia" aria-pressed={dia?.toDateString() === d.toDateString()} disabled={!atiende(d)} onClick={() => setDia(d)}>
                    <small>{DIAS[d.getDay()].substring(0, 3)}</small>
                    <strong>{d.getDate()}</strong>
                    <small>{atiende(d) ? MESES[d.getMonth()].substring(0, 3) : 'cerrado'}</small>
                  </button>
                ))}
              </div>

              {dia && <p className="texto-2" style={{ marginBottom: 14 }}>Horarios libres del {DIAS[dia.getDay()]} {dia.getDate()} de {MESES[dia.getMonth()]}</p>}
              {!horarios && <div className="esqueleto" style={{ height: 112 }} />}
              {horarios && horarios.length === 0 && <p className="mensaje-error">No quedan horarios libres este día. Probá con otro.</p>}
              {horarios && horarios.length > 0 && (
                <div className="horas" role="group" aria-label="Horario">
                  {horarios.map((h) => (
                    <button key={h.hora} className="hora" aria-pressed={hora === h.hora} onClick={() => (setHora(h.hora), setProfesionalId(0))}>
                      {h.hora}
                    </button>
                  ))}
                </div>
              )}

              {horarioElegido && (
                <div style={{ marginTop: 28 }}>
                  <p className="texto-2" style={{ marginBottom: 12 }}>¿Con quién?</p>
                  <div className="opciones">
                    <button className="opcion" aria-pressed={profesionalId === 0} onClick={() => setProfesionalId(0)}>
                      <div><strong>Me da igual</strong><span>Te asignamos quien esté libre</span></div>
                    </button>
                    {horarioElegido.profesionales.map((id) => (
                      <button key={id} className="opcion" aria-pressed={profesionalId === id} onClick={() => setProfesionalId(id)}>
                        <span className="iniciales">{nombreProfesional(id).split(' ').map((n) => n[0]).join('')}</span>
                        <div><strong>{nombreProfesional(id)}</strong><span>{profesionales.datos?.find((p) => p.id === id)?.especialidad}</span></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="navegacion-pasos">
                <button className="boton boton-claro" onClick={() => irA(0)}>Cambiar tratamiento</button>
                <button className="boton" disabled={!hora} onClick={() => irA(2)}>Continuar</button>
              </div>
            </section>
          )}

          {paso === 2 && (
            <section className="paso-reserva">
              <h2>Tus datos</h2>
              <form className="formulario" onSubmit={alCompletarDatos}>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="r-nombre">Nombre</label>
                    <input id="r-nombre" required autoComplete="given-name" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label htmlFor="r-apellido">Apellido</label>
                    <input id="r-apellido" required autoComplete="family-name" value={cliente.apellido} onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })} />
                  </div>
                </div>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="r-telefono">Teléfono</label>
                    <input id="r-telefono" type="tel" required autoComplete="tel" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label htmlFor="r-email">Mail</label>
                    <input id="r-email" type="email" required autoComplete="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
                  </div>
                </div>
                <p className="texto-2" style={{ fontSize: 'var(--t-s)' }}>No hace falta crear una cuenta. Te mandamos la confirmación y el link para cancelar a este mail.</p>
                <div className="navegacion-pasos">
                  <button type="button" className="boton boton-claro" onClick={() => irA(1)}>Volver</button>
                  <button className="boton">Continuar</button>
                </div>
              </form>
            </section>
          )}

          {paso === 3 && tratamiento && dia && (
            <section className="paso-reserva">
              <h2>Revisá y confirmá</h2>
              <dl className="lista-datos">
                <div><dt>Tratamiento</dt><dd>{tratamiento.nombre}</dd></div>
                <div><dt>Día</dt><dd>{fechaLarga(fechaISO(dia))}</dd></div>
                <div><dt>Horario</dt><dd>{hora} hs ({tratamiento.duracionMinutos} min)</dd></div>
                <div><dt>Profesional</dt><dd>{profesionalId ? nombreProfesional(profesionalId) : 'Quien esté libre'}</dd></div>
                <div><dt>A nombre de</dt><dd>{cliente.nombre} {cliente.apellido}</dd></div>
                <div><dt>Seña ahora</dt><dd>{precio(sena)}</dd></div>
                <div><dt>Resto en el estudio</dt><dd>{precio(tratamiento.precio - sena)}</dd></div>
              </dl>
              <p className="texto-2" style={{ fontSize: 'var(--t-s)', marginTop: 16 }}>
                Te guardamos el horario 15 minutos mientras pagás. Podés cancelar desde el link del mail hasta 24 horas antes; la seña queda a favor para tu próximo turno.
              </p>
              {error && <p className="mensaje-error" style={{ marginTop: 16 }}>{error}</p>}
              <div className="navegacion-pasos">
                <button className="boton boton-claro" onClick={() => irA(2)} disabled={enviando}>Volver</button>
                <button className="boton" onClick={confirmar} disabled={enviando}>{enviando ? 'Reservando…' : `Pagar seña de ${precio(sena)}`}</button>
              </div>
            </section>
          )}
          {error && paso !== 3 && <p className="mensaje-error" style={{ marginTop: 16 }}>{error}</p>}
        </div>

        <aside className="resumen-lateral" aria-label="Tu reserva">
          {tratamiento ? (
            <>
              <img src={tratamiento.imagen} alt="" />
              <div className="cuerpo">
                <h3>{tratamiento.nombre}</h3>
                <dl>
                  <div><dt>Duración</dt><dd>{tratamiento.duracionMinutos} min</dd></div>
                  {dia && <div><dt>Día</dt><dd style={{ textTransform: 'capitalize' }}>{DIAS[dia.getDay()]} {dia.getDate()}/{dia.getMonth() + 1}</dd></div>}
                  {hora && <div><dt>Horario</dt><dd>{hora} hs</dd></div>}
                  {profesionalId > 0 && <div><dt>Con</dt><dd>{nombreProfesional(profesionalId)}</dd></div>}
                  <div className="total"><dt>Total</dt><dd>{precio(tratamiento.precio)}</dd></div>
                  <div><dt>Seña (30%)</dt><dd>{precio(sena)}</dd></div>
                </dl>
              </div>
            </>
          ) : (
            <div className="cuerpo">
              <h3>Tu reserva</h3>
              <p className="texto-2" style={{ fontSize: 'var(--t-s)' }}>Elegí un tratamiento para ver duración, precio y seña.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
