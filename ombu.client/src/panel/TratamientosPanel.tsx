import { useState } from 'react'
import { enviar } from '../api'
import { useApi } from '../useApi'
import type { Tratamiento } from '../tipos'

export default function TratamientosPanel() {
  const { datos, cargando, setDatos } = useApi<Tratamiento[]>('/api/Panel/tratamientos')
  const [guardado, setGuardado] = useState<number | null>(null)
  const [error, setError] = useState('')

  const cambiar = (id: number, campo: keyof Tratamiento, valor: unknown) =>
    setDatos((datos ?? []).map((t) => (t.id === id ? { ...t, [campo]: valor } : t)))

  async function guardar(t: Tratamiento) {
    setError('')
    try {
      await enviar('/api/Panel/tratamientos', 'PUT', t)
      setGuardado(t.id)
      setTimeout(() => setGuardado(null), 2000)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Tratamientos</h1>
          <p>Los cambios de precio no afectan a los turnos ya reservados.</p>
        </div>
      </div>
      {error && <p className="mensaje-error" style={{ marginBottom: 16 }}>{error}</p>}
      {cargando ? (
        <div className="cargando"><div className="giro" /></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead>
              <tr>
                <th>Tratamiento</th>
                <th>Tipo</th>
                <th className="num">Duración (min)</th>
                <th className="num">Precio</th>
                <th>Se puede reservar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(datos ?? []).map((t) => (
                <tr key={t.id} className={t.activo ? '' : 'apagado'}>
                  <td>
                    <div className="celda-producto">
                      <img className="miniatura" src={t.imagen} alt="" />
                      <strong>{t.nombre}</strong>
                    </div>
                  </td>
                  <td>{t.tipo}</td>
                  <td className="num">
                    <input className="selector" style={{ width: 90, textAlign: 'right' }} type="number" min={1} max={60} value={t.duracionMinutos} aria-label={`Duración de ${t.nombre}`} onChange={(e) => cambiar(t.id, 'duracionMinutos', Number(e.target.value))} />
                  </td>
                  <td className="num">
                    <input className="selector" style={{ width: 120, textAlign: 'right' }} type="number" min={1} value={t.precio} aria-label={`Precio de ${t.nombre}`} onChange={(e) => cambiar(t.id, 'precio', Number(e.target.value))} />
                  </td>
                  <td>
                    <label className="interruptor"><input type="checkbox" checked={t.activo} onChange={(e) => cambiar(t.id, 'activo', e.target.checked)} /> {t.activo ? 'Sí' : 'No'}</label>
                  </td>
                  <td>
                    <div className="acciones-fila">
                      <button className="boton boton-claro boton-chico" onClick={() => guardar(t)}>{guardado === t.id ? 'Guardado' : 'Guardar'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
