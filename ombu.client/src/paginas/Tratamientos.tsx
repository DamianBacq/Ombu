import { Link } from 'react-router-dom'
import { precio } from '../formato'
import { useApi } from '../useApi'
import type { Tratamiento } from '../tipos'

export default function Tratamientos() {
  const { datos, cargando, error } = useApi<Tratamiento[]>('/api/Estudio/tratamientos')

  return (
    <div className="contenedor">
      <header className="titulo-pagina">
        <h1>Tratamientos</h1>
        <p>Todos empiezan con una charla corta sobre tu piel. Los precios incluyen los productos que usamos en cabina.</p>
      </header>

      {cargando && <div className="esqueleto" style={{ height: 480, marginBottom: 96 }} />}
      {error && <p className="mensaje-error">{error}</p>}

      {(['Facial', 'Corporal'] as const).map((tipo) => (
        <section key={tipo} style={{ marginBottom: 96 }}>
          {datos && <h2 style={{ fontSize: 'var(--t-xl)', marginBottom: 8 }}>{tipo === 'Facial' ? 'Faciales' : 'Corporales'}</h2>}
          {(datos ?? []).filter((t) => t.tipo === tipo).map((t) => (
            <article key={t.id} className="tratamiento-detalle">
              <img src={t.imagen} alt="" loading="lazy" />
              <div>
                <h3>{t.nombre}</h3>
                <p className="texto-2">{t.descripcion}</p>
                <dl className="propiedades">
                  <dt>Duración</dt>
                  <dd>{t.duracionMinutos} minutos</dd>
                  <dt>Precio</dt>
                  <dd>{precio(t.precio)}</dd>
                  <dt>Seña para reservar</dt>
                  <dd>{precio(Math.round((t.precio * 0.3) / 100) * 100)}</dd>
                </dl>
                <Link to={`/reservar?tratamiento=${t.slug}`} className="boton" style={{ marginTop: 24 }}>Reservar {t.nombre.toLowerCase()}</Link>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
