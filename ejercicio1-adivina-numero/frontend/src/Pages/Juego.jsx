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
    <div style={{
      maxWidth: '420px',
      margin: '60px auto',
      padding: '30px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#1e1e2f',
      color: '#15da64',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#fff' }}>Adivina el Número</h1>
      <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '25px' }}>Adivina un número entre 1 y 100</p>

      <form onSubmit={enviarIntento} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }} >
        <input
          type="number"
          min="1"
          max="100"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          disabled={gano}
          required
          placeholder="Ej. 50"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #15da64',
            background: '#2d3748',
            color: '#fff',
            fontSize: '1rem',
            width: '100px',
            outline: 'none'
          }}
        />
        <button type="submit"
          disabled={gano}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: gano ? '#4a5568' : '#3182ce',
            color: '#fff',
            fontWeight: 'bold',
            cursor: gano ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >Probar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p><strong>{mensaje}</strong></p>}
      {gano && <p style={{ color: '#d43f1a', fontWeight: 'bold', fontSize: '1.1rem' }}> ¡Ganaste en {intentos.length} intentos!</p>}

      <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px', margin: '20px 0', fontSize: '0.95rem' }}>
        <span>Intentos fallidos: <strong>{fallidos}</strong></span>
      </div>

      <h3>Historial</h3>
      <ul>
        {intentos.map((n, i) => (
          <li key={i} >{n}</li>
        ))}
      </ul>

      <button onClick={reiniciar}
        style={{
          marginTop: '25px',
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #4a5568',
          background: 'transparent',
          color: '#a0aec0',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>Reiniciar juego</button>
    </div>
  )
}

export default Juego