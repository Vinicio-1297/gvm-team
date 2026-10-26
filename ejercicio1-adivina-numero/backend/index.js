const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Estado del juego 
const MIN = 1;
const MAX = 100;

const generarNumero = () => Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

let numeroSecreto = generarNumero();

// POST /guess  -> body
app.post('/guess', (req, res) => {
  const { numero } = req.body ?? {};

  if (typeof numero !== 'number' || !Number.isInteger(numero) || numero < MIN || numero > MAX) {
    return res
      .status(400)
      .json({ error: `Debes enviar un número entero entre ${MIN} y ${MAX}` });
  }

  let resultado;
  if (numeroSecreto > numero) {
    resultado = 'mayor';
  } else if (numeroSecreto < numero) {
    resultado = 'menor';
  } else {
    resultado = 'correcto';
  }

  const mensajes = {
    mayor: 'El número oculto es mayor',
    menor: 'El número oculto es menor',
    correcto: '¡Correcto! Adivinaste el número',
  };

  res.json({ resultado, mensaje: mensajes[resultado] });
});

// POST /reset ->  genera un nuevo número oculto
app.post('/reset', (req, res) => {
  numeroSecreto = generarNumero();
  res.json({ mensaje: 'Juego reiniciado, nuevo número generado' });
});

app.listen(PORT, () => {
  console.log(`Backend Adivina el Número en http://localhost:${PORT}`);
});