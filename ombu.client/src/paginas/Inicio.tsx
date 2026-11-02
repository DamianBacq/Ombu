import { useState } from 'react'
import { Link } from 'react-router-dom'
import Contacto from '../componentes/Contacto'
import ListaTratamientos from '../componentes/ListaTratamientos'
import TarjetaProducto from '../componentes/TarjetaProducto'
import { IconoCamion, IconoFlecha, IconoReloj, IconoUbicacion } from '../componentes/Iconos'
import { useApi } from '../useApi'
import type { HorarioAtencion, Producto, Profesional, Tratamiento } from '../tipos'

// "Abierto hasta las 19" / "Abre mañana a las 9", según el horario y la hora actual
function estadoHoy(horarios: HorarioAtencion[]) {
  const ahora = new Date()
  const minutos = ahora.getHours() * 60 + ahora.getMinutes()
  const aMinutos = (h: string) => Number(h.substring(0, 2)) * 60 + Number(h.substring(3, 5))
  const hoy = horarios.filter((h) => h.diaSemana === ahora.getDay())
  const abierta = hoy.find((h) => minutos >= aMinutos(h.horaDesde) && minutos < aMinutos(h.horaHasta))
  if (abierta) return { abierto: true, texto: `Abierto hoy hasta las ${abierta.horaHasta.substring(0, 5)}` }

  for (let i = 0; i < 7; i++) {
    const dia = (ahora.getDay() + i) % 7
    const proxima = horarios
      .filter((h) => h.diaSemana === dia && (i > 0 || aMinutos(h.horaDesde) > minutos))
      .sort((a, b) => a.horaDesde.localeCompare(b.horaDesde))[0]
    if (proxima) {
      const cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'][dia]
      return { abierto: false, texto: `Abre ${cuando} a las ${proxima.horaDesde.substring(0, 5)}` }
    }
  }
  return null
}

export default function Inicio() {
  const tratamientos = useApi<Tratamiento[]>('/api/Estudio/tratamientos')
  const productos = useApi<Producto[]>('/api/Catalogo/productos')
  const horarios = useApi<HorarioAtencion[]>('/api/Estudio/horarios')
  const profesionales = useApi<Profesional[]>('/api/Estudio/profesionales')
  const [tipo, setTipo] = useState<'Facial' | 'Corporal'>('Facial')

  const estado = horarios.datos ? estadoHoy(horarios.datos) : null
  const destacados = (productos.datos ?? []).filter((p) => p.destacado).slice(0, 4)

  return (
    <>
      <section className="portada">
        <div className="contenedor">
          <div className="portada-texto">
            <h1>
              <span className="linea"><span>Piel tranquila,</span></span>
              <span className="linea"><span>cuidada</span></span>
              <span className="linea"><span>sin apuro.</span></span>
            </h1>
            <p>Tratamientos faciales y masajes en un estudio chico de Lomas de Zamora. Reservá online en un minuto y llevate a casa la rutina que usamos en cabina.</p>
            <div className="portada-botones">
              <Link to="/reservar" className="boton">Reservar turno</Link>
              <Link to="/tienda" className="boton boton-claro">Ver la tienda</Link>
            </div>
          </div>
          <div className="portada-imagen">
            <div className="arco-grande">
              <img src="/img/hero.jpg" alt="Sérum facial sobre una tabla de madera con hojas de eucalipto" fetchPriority="high" />
            </div>
            <div className="circulo-chico">
              <img src="/img/estudio.jpg" alt="" />
            </div>
            {estado && (
              <div className="estado-hoy">
                <span className={`punto ${estado.abierto ? '' : 'cerrado'}`} />
                {estado.texto}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="datos-estudio" aria-label="Datos útiles">
        <div className="contenedor">
          <div className="dato">
            <IconoReloj />
            <div><strong>Turnos online las 24 horas</strong>Elegís día, horario y profesional. Confirmás con una seña.</div>
          </div>
          <div className="dato">
            <IconoCamion />
            <div><strong>Envíos a todo el país</strong>Gratis desde $60.000. O retirás en el estudio sin costo.</div>
          </div>
          <div className="dato">
            <IconoUbicacion />
            <div><strong>Lomas de Zamora</strong>A pocas cuadras de la estación, con estacionamiento.</div>
          </div>
        </div>
      </section>

      <section className="seccion" id="tratamientos">
        <div className="contenedor">
          <div className="cabecera-seccion">
            <h2>Tratamientos</h2>
            <div className="pestanas" role="group" aria-label="Tipo de tratamiento">
              <button aria-pressed={tipo === 'Facial'} onClick={() => setTipo('Facial')}>Faciales</button>
              <button aria-pressed={tipo === 'Corporal'} onClick={() => setTipo('Corporal')}>Corporales</button>
            </div>
          </div>
          {tratamientos.cargando ? (
            <div className="esqueleto" style={{ height: 420 }} />
          ) : (
            <ListaTratamientos tratamientos={(tratamientos.datos ?? []).filter((t) => t.tipo === tipo)} />
          )}
          <p style={{ marginTop: 28 }}>
            <Link to="/tratamientos" className="enlace">Ver el detalle de cada tratamiento</Link>
          </p>
        </div>
      </section>

      <section className="seccion como-reservar">
        <div className="contenedor">
          <div className="cabecera-seccion">
            <h2>Reservar lleva un minuto</h2>
            <p>Sin llamadas ni mensajes de ida y vuelta. Ves los horarios libres en tiempo real.</p>
          </div>
          <ol className="pasos">
            <li>
              <h3>Elegí el tratamiento</h3>
              <p>Cada uno muestra cuánto dura y cuánto sale, sin sorpresas.</p>
            </li>
            <li>
              <h3>Elegí día y horario</h3>
              <p>Solo aparecen los horarios libres. Si tenés preferencia, elegís la profesional.</p>
            </li>
            <li>
              <h3>Confirmá con la seña</h3>
              <p>Pagás el 30% con Mercado Pago y el resto en el estudio. Podés cancelar hasta 24 horas antes.</p>
            </li>
          </ol>
          <Link to="/reservar" className="boton">Reservar ahora <IconoFlecha /></Link>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <div className="cabecera-seccion">
            <h2>La rutina, en casa</h2>
            <p>Los mismos productos que usamos en cabina. Te ayudamos a elegir según tu tipo de piel.</p>
          </div>
          <div className="grilla-productos">
            {productos.cargando
              ? [1, 2, 3, 4].map((n) => <div key={n} className="esqueleto" style={{ aspectRatio: '4 / 5.8' }} />)
              : destacados.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
          <p style={{ marginTop: 36 }}>
            <Link to="/tienda" className="boton boton-claro">Ver todos los productos</Link>
          </p>
        </div>
      </section>

      <section className="estudio" id="estudio">
        <img src="/img/estudio.jpg" alt="Sala del estudio con plantas, sillón de mimbre y una pileta baja" loading="lazy" />
        <div className="estudio-texto">
          <h2>Un estudio chico, a propósito</h2>
          <p>Atendemos de a una persona por cabina, con turnos de una hora para no correr. Antes de empezar miramos tu piel y te explicamos qué vamos a hacer y por qué.</p>
          <ul className="equipo">
            {(profesionales.datos ?? []).map((p) => (
              <li key={p.id}>
                <span className="iniciales">{p.nombre.split(' ').map((n) => n[0]).join('')}</span>
                <div>
                  <strong>{p.nombre}</strong>
                  <span>{p.especialidad}. {p.tipo === 'Facial' ? 'Tratamientos faciales' : 'Masajes y drenaje'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contacto horarios={horarios.datos ?? []} />
    </>
  )
}
