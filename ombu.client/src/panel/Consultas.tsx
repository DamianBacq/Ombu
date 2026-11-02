import { enviar } from '../api'
import { fechaLarga, hora } from '../formato'
import { useApi } from '../useApi'
import type { Consulta } from '../tipos'

export default function Consultas() {
  const { datos, cargando, setDatos } = useApi<Consulta[]>('/api/Panel/consultas')

  async function marcarLeida(c: Consulta) {
    await enviar(`/api/Panel/consultas/${c.id}/leida`, 'PUT')
    setDatos((datos ?? []).map((x) => (x.id === c.id ? { ...x, leida: true } : x)))
  }

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Consultas</h1>
          <p>Mensajes del formulario de contacto. Respondé por mail y marcalos como leídos.</p>
        </div>
      </div>
      {cargando && <div className="cargando"><div className="giro" /></div>}
      {datos?.length === 0 && <p className="texto-2">Todavía no llegaron consultas.</p>}
      {(datos ?? []).map((c) => (
        <article key={c.id} className={`consulta ${c.leida ? '' : 'nueva'}`}>
          <header>
            <strong>{c.nombre}</strong>
            <span>{fechaLarga(c.fecha)}, {hora(c.fecha)} hs</span>
          </header>
          <p>{c.mensaje}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="boton boton-chico" href={`mailto:${c.email}?subject=Tu consulta en Ombú`} onClick={() => !c.leida && marcarLeida(c)}>Responder a {c.email}</a>
            {!c.leida && <button className="boton boton-claro boton-chico" onClick={() => marcarLeida(c)}>Marcar como leída</button>}
          </div>
        </article>
      ))}
    </>
  )
}
