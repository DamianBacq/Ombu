import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { IconoAlerta } from '../componentes/Iconos'

interface Resultado {
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado'
  tipo: 'turno' | 'pedido'
  codigo: string
}

// Mercado Pago vuelve acá con payment_id y external_reference. Se verifica siempre contra la API.
export default function PagoResultado() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const paymentId = params.get('payment_id')
    const referencia = params.get('external_reference')
    const consulta = paymentId && paymentId !== 'null' ? `paymentId=${paymentId}` : `externalReference=${referencia}`
    api<Resultado>(`/api/Pagos/verificar?${consulta}`)
      .then((r) => {
        if (r.estado === 'Aprobado') navegar(`/${r.tipo}/${r.codigo}`, { replace: true })
        else setResultado(r)
      })
      .catch((e: Error) => setError(e.message))
  }, [params, navegar])

  if (!resultado && !error) return <div className="cargando"><div className="giro" /></div>

  return (
    <div className="contenedor">
      <div className="tarjeta-estado">
        <div className="icono-estado mal"><IconoAlerta /></div>
        <h1>{resultado?.estado === 'Pendiente' ? 'El pago está en proceso' : 'El pago no se completó'}</h1>
        <p className="texto-2">
          {error || (resultado?.estado === 'Pendiente'
            ? 'Mercado Pago todavía lo está procesando. Te avisamos por mail apenas se acredite.'
            : 'No se hizo ningún cargo. Podés intentar de nuevo con otro medio de pago.')}
        </p>
        {resultado && (
          <div>
            <Link to={`/${resultado.tipo}/${resultado.codigo}`} className="boton">
              {resultado.tipo === 'turno' ? 'Ver mi turno' : 'Ver mi pedido'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
