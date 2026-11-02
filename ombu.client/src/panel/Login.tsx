import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { enviar, guardarToken } from '../api'
import Marca from '../componentes/Marca'
import '../panel/panel.css'

export default function Login() {
  const navegar = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function ingresar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const { token } = await enviar<{ token: string }>('/api/Auth/login', 'POST', { usuario, password })
      guardarToken(token)
      navegar('/panel')
    } catch (err) {
      setError((err as Error).message)
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <img src="/img/ritual.jpg" alt="" />
      <form onSubmit={ingresar}>
        <Marca />
        <h1>Panel del estudio</h1>
        <div className="campo">
          <label htmlFor="l-usuario">Usuario</label>
          <input id="l-usuario" required autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="l-password">Contraseña</label>
          <input id="l-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="mensaje-error">{error}</p>}
        <button className="boton boton-ancho" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="pista-demo">Para probar: usuario <strong>admin</strong>, contraseña <strong>ombu2026</strong>.</p>
      </form>
    </div>
  )
}
