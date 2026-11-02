import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MESES, fechaCorta, leerFecha, precio } from '../formato'
import type { Resumen as DatosResumen } from '../tipos'

// Colores de las series (validados para daltonismo): tienda verde, estudio orquídea
const COLOR_TIENDA = '#16875A'
const COLOR_ESTUDIO = '#8C6BC0'

const miles = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)} mil` : `$${v}`)

function Grafico({ dias }: { dias: DatosResumen['ventasPorDia'] }) {
  const [activo, setActivo] = useState<number | null>(null)
  const ancho = 720
  const alto = 260
  const izq = 56
  const abajo = 24
  const maximo = Math.max(...dias.map((d) => d.tienda + d.estudio), 1)
  const paso = Math.pow(10, Math.floor(Math.log10(maximo / 4)))
  const intervalo = Math.ceil(maximo / 4 / paso) * paso
  const tope = intervalo * 4
  const y = (v: number) => (alto - abajo) * (1 - v / tope)
  const columna = (ancho - izq) / dias.length
  const barra = Math.max(4, columna - 6)

  // Barra con las esquinas de arriba redondeadas, apoyada en la base
  const segmento = (x: number, y1: number, y2: number, redondear: boolean) => {
    const h = y2 - y1
    if (h <= 0) return ''
    const r = redondear ? Math.min(4, h, barra / 2) : 0
    return `M${x},${y2} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + barra - r} Q${x + barra},${y1} ${x + barra},${y1 + r} V${y2} Z`
  }

  const d = activo !== null ? dias[activo] : null

  return (
    <div className="grafico">
      <svg viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none" role="img" aria-label="Ingresos diarios de los últimos 30 días, tienda y estudio">
        <g className="grilla">
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={izq} x2={ancho} y1={y(intervalo * i)} y2={y(intervalo * i)} />)}
        </g>
        <g className="eje">
          {[0, 1, 2, 3, 4].map((i) => <text key={i} x={izq - 8} y={y(intervalo * i) + 4} textAnchor="end">{miles(intervalo * i)}</text>)}
          {dias.map((dia, i) => (i % 5 === 4 || i === dias.length - 1) && (
            <text key={i} x={izq + i * columna + columna / 2} y={alto - 6} textAnchor="middle">{fechaCorta(dia.fecha)}</text>
          ))}
        </g>
        {dias.map((dia, i) => {
          const x = izq + i * columna + (columna - barra) / 2
          const base = y(0)
          const yTienda = y(dia.tienda)
          const yTotal = y(dia.tienda + dia.estudio)
          const hayEstudio = dia.estudio > 0
          return (
            <g key={dia.fecha} opacity={activo === null || activo === i ? 1 : 0.45}>
              <path d={segmento(x, yTienda, base, !hayEstudio)} fill={COLOR_TIENDA} />
              {hayEstudio && <path d={segmento(x, yTotal, dia.tienda > 0 ? yTienda - 2 : base, true)} fill={COLOR_ESTUDIO} />}
              <rect className="zona" x={izq + i * columna} y={0} width={columna} height={alto - abajo} onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)} />
            </g>
          )
        })}
      </svg>
      {d && activo !== null && (
        <div className="tooltip" style={{ left: `${((izq + activo * columna + columna / 2) / ancho) * 100}%`, top: `${(y(d.tienda + d.estudio) / alto) * 100}%` }}>
          <strong>{leerFecha(d.fecha).getDate()} de {MESES[leerFecha(d.fecha).getMonth()]}: {precio(d.tienda + d.estudio)}</strong>
          <span><i style={{ background: COLOR_TIENDA }} />Tienda {precio(d.tienda)}</span><br />
          <span><i style={{ background: COLOR_ESTUDIO }} />Estudio {precio(d.estudio)}</span>
        </div>
      )}
    </div>
  )
}

export default function Resumen({ datos, cargando }: { datos: DatosResumen | null; cargando: boolean }) {
  if (cargando || !datos) return <div className="cargando"><div className="giro" /></div>

  const variacion = datos.ventasMesAnterior ? Math.round(((datos.ventasMes - datos.ventasMesAnterior) / datos.ventasMesAnterior) * 100) : 0
  const maxVendido = Math.max(...datos.masVendidos.map((p) => p.unidades), 1)
  const hoy = new Date()

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Resumen</h1>
          <p>Ingresos de {MESES[hoy.getMonth()]}, turnos y pedidos pendientes.</p>
        </div>
      </div>

      <div className="indicadores">
        <div className="indicador">
          <span>Ingresos del mes</span>
          <strong>{precio(datos.ventasMes)}</strong>
          <small className={variacion >= 0 ? 'sube' : 'baja'}>{variacion >= 0 ? '+' : ''}{variacion}% </small>
          <small>contra el mes anterior</small>
        </div>
        <div className="indicador">
          <span>Pedidos del mes</span>
          <strong>{datos.pedidosMes}</strong>
          <small>Ticket promedio {precio(datos.ticketPromedio)}</small>
        </div>
        <Link to="/panel/agenda" className="indicador">
          <span>Turnos de hoy</span>
          <strong>{datos.turnosHoy}</strong>
          <small>{datos.turnosSemana} en los próximos 7 días</small>
        </Link>
        <Link to="/panel/pedidos" className="indicador">
          <span>Pedidos por preparar</span>
          <strong>{datos.pedidosPorPreparar}</strong>
          <small>Pagados o en preparación</small>
        </Link>
      </div>

      <div className="tablero">
        <section className="caja">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2>Ingresos por día</h2>
              <p className="sub">Últimos 30 días</p>
            </div>
            <div className="leyenda">
              <span><i style={{ background: COLOR_TIENDA }} />Tienda</span>
              <span><i style={{ background: COLOR_ESTUDIO }} />Estudio</span>
            </div>
          </div>
          <Grafico dias={datos.ventasPorDia} />
        </section>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <section className="caja">
            <h2>Más vendidos</h2>
            <p className="sub">Unidades en los últimos 30 días</p>
            <ol className="ranking">
              {datos.masVendidos.map((p) => (
                <li key={p.nombre}>
                  <span>{p.nombre}</span>
                  <span className="num">{p.unidades} u.</span>
                  <div className="barra"><div style={{ width: `${(p.unidades / maxVendido) * 100}%` }} /></div>
                </li>
              ))}
            </ol>
          </section>
          <section className="caja">
            <h2>Stock bajo</h2>
            <p className="sub">5 unidades o menos</p>
            {datos.stockBajo.length === 0 ? (
              <p className="sub" style={{ marginTop: 12 }}>Todo el catálogo tiene stock.</p>
            ) : (
              <ul className="lista-stock">
                {datos.stockBajo.map((p) => (
                  <li key={p.id}>
                    <img src={p.imagen} alt="" />
                    {p.nombre}
                    <span className="cant" style={{ color: p.stock === 0 ? 'var(--error)' : undefined }}>{p.stock === 0 ? 'Sin stock' : `${p.stock} u.`}</span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ marginTop: 12 }}><Link to="/panel/productos" className="enlace" style={{ fontSize: 'var(--t-s)' }}>Actualizar stock</Link></p>
          </section>
        </div>
      </div>
    </>
  )
}
