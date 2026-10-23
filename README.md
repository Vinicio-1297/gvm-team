# gvm-team
Evalucion 2 de programacion web
## Estructura
- `ejercicio1-adivina-numero/`: juego "Adivina el Número"
  - `backend/`: Express
  - `frontend/`: Vite + React
- `ejercicio2-food-dei/`: reservas de Food DEI
  - `backend/`: Express
  - `frontend/`: Vite + React + Reactstrap


  ## Cómo correr cada ejercicio

Se necesitan **dos terminales** por ejercicio: una para el backend y otra para el frontend.

### Ejercicio 1
```bash
# Terminal 1: backend
cd ejercicio1-adivina-numero/backend
npm install
node index.js *se cambiara por otro nombre, ya que es el nombre por defecto*

# Terminal 2: frontend
cd ejercicio1-adivina-numero/frontend
npm install
npm run dev
```

### Ejercicio 2
```bash
# Terminal 1: backend
cd ejercicio2-food-dei/backend
npm install
node index.js

# Terminal 2: frontend
cd ejercicio2-food-dei/frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000