import { useState } from 'react'

const API = 'http://localhost:3000'

function Juego() {
  const [numero, setNumero] = useState('')
  const [intentos, setIntentos] = useState([])   // historial de números probados
  const [mensaje, setMensaje] = useState('')      // mensaje del servidor
  const [gano, setGano] = useState(false)
  const [error, setError] = useState('')

  const enviarIntento = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: Number(numero) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMensaje(data.mensaje)
      setIntentos([...intentos, Number(numero)])
      if (data.resultado === 'correcto') setGano(true)
      setNumero('')
    } catch (err) {
      setError(err.message)
    }
  }

  const reiniciar = async () => {
    try {
      await fetch(`${API}/reset`, { method: 'POST' })
      setIntentos([])
      setMensaje('')
      setGano(false)
      setError('')
      setNumero('')
    } catch (err) {
      setError(err.message)
    }
  }

  const fallidos = gano ? intentos.length - 1 : intentos.length

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Adivina el Número</h1>

      <form onSubmit={enviarIntento}>
        <input
          type="number"
          min="1"
          max="100"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          disabled={gano}
          required
        />
        <button type="submit" disabled={gano}>Probar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p><strong>{mensaje}</strong></p>}
      {gano && <p> ¡Ganaste en {intentos.length} intentos!</p>}

      <p>Intentos fallidos: {fallidos}</p>

      <h3>Historial</h3>
      <ul>
        {intentos.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>

      <button onClick={reiniciar}>Reiniciar juego</button>
    </div>
  )
}

export default Juego