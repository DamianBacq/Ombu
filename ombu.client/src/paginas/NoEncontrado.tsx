import { Link } from 'react-router-dom'

export default function NoEncontrado() {
  return (
    <div className="tarjeta-estado">
      <h1>No encontramos esta página</h1>
      <p className="texto-2">Puede que el link esté incompleto o que el producto ya no esté a la venta.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/" className="boton">Ir al inicio</Link>
        <Link to="/tienda" className="boton boton-claro">Ver la tienda</Link>
      </div>
    </div>
  )
}
