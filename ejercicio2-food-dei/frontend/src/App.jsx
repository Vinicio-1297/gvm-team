import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Alert,
  UncontrolledAlert,
  Badge,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  Button,
  ListGroup,
  ListGroupItem,
  ButtonGroup
} from 'reactstrap';
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
const api_url = "http://localhost:3000";
function App() {
  const [agregar, setagregar] = useState('');
  const [menu, setmenu] = useState([]);
  const [reserva, setReserva] = useState([]);
  const [saldo, setSaldo] = useState(25.00); // Saldo inicial simulado o traído de usuario
  const [totalReserva, setTotalReserva] = useState(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    cargarMenu();
    cargarReserva();
  }, []);

  

  
  const cargarMenu = async () => {
     try {
       const response = await fetch(`${api_url}/menu`);
       setmenu(response.data);
     } catch (error) {
       manejarError(error);
     }
  };

  // Endpoint 2: Obtener la bandeja de reserva actual (Carrito)
   const cargarReserva = async () => {
     try {
      const res = await fetch(`${api_url}/reserva`);
      const datosreserva = await res.json();
      setReserva(datosreserva.data || []);
       setTotalReserva(datosreserva.total || 0);
       if(datosreserva.saldo !== undefined) setSaldo(datosreserva.saldo);
     } catch (error) {
       manejarError(error);
     }
   };

  // Endpoint 3: Añadir un platillo por primera vez a la reserva
  const añadirAForm = async (Id) => {
    try {
      setError(null);
      await fetch(`${api_url}/reserva`,{
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        Id,
        cantidad: 1
  
      })});
      
      // Recargar datos para asegurar sincronización con reglas de negocio del backend
      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      manejarError(error);
    }
  };

  
  const actualizarPorciones = async (Id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return; // Se debe usar el botón quitar para eliminarlo
    try {
      setError(null);
      await fetch(`${api_url}/reserva/${Id}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        Id,
        cantidad: nuevaCantidad
  
      })});
      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      manejarError(error);
    }
  };

  
  const quitarDeReserva = async (Id) => {
    try {
      setError(null);
      await fetch(`${api_url}/reserva/${Id}`,
        {method: 'delete'}
      );
      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      manejarError(error);
    }
  };


  const manejarError = (error) => {
    const mensaje = error.response?.data?.message || 'Ocurrió un error en el servidor.';
    setError(mensaje);
  };
 return (
    <Container className="mt-4">
      {/* Zona de Alertas de Negocio (Errores de saldo o stock) */}
      {error && (
        <UncontrolledAlert color="warning" toggle={() => setError(null)}>
          <strong>¡Atención!</strong> {error}
        </UncontrolledAlert>
      )}

      {}
      <Alert color="info" className="d-flex justify-content-between align-items-center shadow-sm">
        <h5 className="mb-0">
          Tu saldo actual: <strong className="text-success">${saldo.toFixed(2)}</strong>
        </h5>
        <h5 className="mb-0">
          Total de tu Reserva: {' '}
          <Badge color="dark" pill>
            ${totalReserva.toFixed(2)}
          </Badge>
        </h5>
      </Alert>

      
      <Row className="mt-4">
        {}
        <Col xs="12" md="8">
          <h3 className="mb-3">Menú del Día</h3>
          <Row>
            {menu.map((platillo) => (
              <Col xs="12" sm="6" md="6" lg="4" key={platillo.id}>
                <Card className="mb-3 shadow-sm">
                  <CardBody>
                    <CardTitle tag="h5" className="d-flex justify-content-between align-items-start">
                      {platillo.nombre}
                    </CardTitle>
                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                      {platillo.categoria}
                    </CardSubtitle>
                    <CardText className="d-flex justify-content-between align-items-center mt-3">
                      <span>Stock: <strong>{platillo.stock}</strong></span>
                      <Badge color="success" size="lg" className="p-2">
                        ${platillo.precio.toFixed(2)}
                      </Badge>
                    </CardText>
                    
                    {}
                    {platillo.stock === 0 ? (
                      <Button color="secondary" block disabled>
                        Agotado
                      </Button>
                    ) : (
                      <Button color="primary" block onClick={() => añadirAForm(platillo.id)}>
                        Añadir a la Reserva
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {}
        <Col xs="12" md="4">
          <div className="p-3 bg-light rounded shadow-sm position-sticky" style={{ top: '20px' }}>
            <h4 className="mb-3 border-bottom pb-2">Tu Bandeja de Reserva</h4>
            {Reserva.length === 0 ? (
              <p className="text-muted text-center my-4">No has seleccionado ningún platillo aún.</p>
            ) : (
              <ListGroup>
                {reserva.map((item) => (
                  <ListGroupItem key={item.id} className="d-flex flex-column gap-2 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{item.nombre}</span>
                      <span className="text-muted small">${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      {/* Control de porciones compacto */}
                      <ButtonGroup size="sm">
                        <Button 
                          color="outline-secondary" 
                          onClick={() => actualizarPorciones(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </Button>
                        <Button color="light" disabled className="text-dark fw-bold px-3">
                          {item.cantidad}
                        </Button>
                        <Button 
                          color="outline-secondary" 
                          onClick={() => actualizarPorciones(item.id, item.cantidad + 1)}
                        >
                          +
                        </Button>
                      </ButtonGroup>

                      {}
                      <Button 
                        color="danger" 
                        outline 
                        size="sm" 
                        onClick={() => quitarDeReserva(item.id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App
