import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { enviar } from '../api'

// Simula el checkout de Mercado Pago cuando no hay credenciales cargadas (modo demo)
export default function PagoDemo() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const pagoId = params.get('pago')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function resolver(aprobado: boolean) {
    setProcesando(true)
    try {
      await enviar(`/api/Pagos/demo/${pagoId}?aprobado=${aprobado}`, 'POST')
      navegar(`/pago/resultado?external_reference=${pagoId}`)
    } catch (e) {
      setError((e as Error).message)
      setProcesando(false)
    }
  }

  return (
    <div className="contenedor">
      <div className="demo-mp">
        <header>
          Checkout de prueba
          <small>Modo demo</small>
        </header>
        <div className="cuerpo">
          <p className="texto-2">
            Esta pantalla reemplaza a Mercado Pago mientras no haya credenciales cargadas. Con el token de la cuenta del estudio, acá se abre el checkout real.
          </p>
          {error && <p className="mensaje-error">{error}</p>}
          <button className="boton boton-ancho" disabled={procesando} onClick={() => resolver(true)}>Simular pago aprobado</button>
          <button className="boton boton-claro boton-ancho" disabled={procesando} onClick={() => resolver(false)}>Simular pago rechazado</button>
        </div>
      </div>
    </div>
  )
}
