import { useState, useEffect } from 'react';
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
  Button,
  ListGroup,
  ListGroupItem,
  ButtonGroup
} from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css'; // Aseguramos que Bootstrap esté cargado
import './App.css';

const api_url = "http://localhost:3000/api";

function App() {
  const [menu, setMenu] = useState([]);
  const [reserva, setReserva] = useState([]);
  const [saldo, setSaldo] = useState(25.00);
  const [totalReserva, setTotalReserva] = useState(0);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [error, setError] = useState(null);
  const [segundos, setSegundos] = useState(null);
  const [expirada, setExpirada] = useState(false);

  const manejarError = (error) => {
    setError(error.message || 'Ocurrió un error en el servidor.');
  };

  const cargarMenu = async () => {
    try {
      const response = await fetch(`${api_url}/menu`);
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      manejarError(error);
    }
  };

  const cargarReserva = async () => {
    try {
      const res = await fetch(`${api_url}/reserva`);
      const datosreserva = await res.json();

      setReserva(datosreserva.itemsReservados || []);
      setTotalReserva(datosreserva.total || 0);
      if (datosreserva.saldo !== undefined) setSaldo(datosreserva.saldo);
      if (datosreserva.confirmada !== undefined) setReservaConfirmada(datosreserva.confirmada);
      setSegundos(datosreserva.segundosRestantes ?? null);
      setExpirada(Boolean(datosreserva.expirada));
    } catch (error) {
      manejarError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await cargarMenu();
      await cargarReserva();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (segundos === null) return;

    if (segundos <= 0) {
      const refrescar = async () => {
        await cargarMenu();
        await cargarReserva();
      };
      refrescar();
      return;
    }

    const id = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [segundos]);

  const añadirAForm = async (alimentoId) => {
    try {
      setError(null);
      const res = await fetch(`${api_url}/reserva/agregar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alimentoId, cantidad: 1 })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al agregar a la reserva");

      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      setError(error.message);
    }
  };

  const actualizarPorciones = async (Id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    try {
      setError(null);
      const res = await fetch(`${api_url}/reserva/actualizar-porciones/${Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al actualizar la cantidad");

      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      setError(error.message);
    }
  };

  const quitarDeReserva = async (Id) => {
    try {
      setError(null);
      const res = await fetch(`${api_url}/reserva/eliminar/${Id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al eliminar el alimento");

      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      setError(error.message);
    }
  };

  const confirmarReserva = async () => {
    try {
      setError(null);
      const res = await fetch(`${api_url}/reserva/confirmar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "No se pudo confirmar la reserva");

      setReservaConfirmada(true);
      setSaldo(data.saldo);
      await cargarReserva();
    } catch (error) {
      setError(error.message);
    }
  };

  const reiniciarReserva = async () => {
    try {
      setError(null);
      const res = await fetch(`${api_url}/reserva/reiniciar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "No se pudo reiniciar la reserva");

      await cargarMenu();
      await cargarReserva();
    } catch (error) {
      setError(error.message);
    }
  };

  const formatearTiempo = (total) => {
    const min = Math.floor(total / 60);
    const seg = String(total % 60).padStart(2, '0');
    return `${min}:${seg}`;
  };

  const obtenerNombrePlatillo = (id) => {
    const platillo = menu.find(p => p.id === id);
    return platillo ? platillo.nombre : 'Platillo desconocido';
  };

  const obtenerPrecioPlatillo = (id) => {
    const platillo = menu.find(p => p.id === id);
    return platillo ? platillo.precio : 0;
  };

  return (
    <Container className="py-4">
      {/* Alertas */}
      {error && (
        <UncontrolledAlert color="danger" toggle={() => setError(null)} className="shadow-sm">
          <strong>¡Atención!</strong> {error}
        </UncontrolledAlert>
      )}

      {expirada && (
        <Alert color="warning" className="d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <strong>⏳ Se acabó el tiempo.</strong> La reserva expiró y las porciones se liberaron.
          </div>
          <Button color="dark" size="sm" onClick={reiniciarReserva}>
            Iniciar nueva reserva
          </Button>
        </Alert>
      )}

      {/* Header / Panel Superior */}
      <div className="p-3 mb-4 bg-white rounded-3 shadow-sm border d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <span className="text-muted small text-uppercase fw-bold d-block">Saldo Disponible</span>
          <h3 className="mb-0 text-success fw-bold">${saldo.toFixed(2)}</h3>
        </div>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <div className="text-end me-2">
            <span className="text-muted small text-uppercase fw-bold d-block">Total Reserva</span>
            <h4 className="mb-0 fw-bold text-dark">${totalReserva.toFixed(2)}</h4>
          </div>

          {segundos !== null && !reservaConfirmada && (
            <Badge color={segundos <= 30 ? 'danger' : 'primary'} className="p-2 fs-6 pill">
               {formatearTiempo(segundos)}
            </Badge>
          )}

          {!reservaConfirmada && reserva.length > 0 && (
            <Button color="success" className="px-3 fw-bold" onClick={confirmarReserva}>
              Confirmar Reserva
            </Button>
          )}

          {(reserva.length > 0 || reservaConfirmada) && (
            <Button color="outline-secondary" size="sm" onClick={reiniciarReserva}>
              {reservaConfirmada ? 'Nueva Reserva' : 'Reiniciar'}
            </Button>
          )}

          {reservaConfirmada && (
            <Badge color="success" className="p-2 fs-6">
              ✓ Reserva Confirmada
            </Badge>
          )}
        </div>
      </div>

      <Row>
        {/* Menú principal */}
        <Col xs="12" lg="8">
          <h4 className="mb-3 fw-bold text-secondary">Menú del Día</h4>
          <Row>
            {menu.map((platillo) => (
              <Col xs="12" sm="6" key={platillo.id} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <CardBody className="d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <CardTitle tag="h5" className="fw-bold mb-0">
                          {platillo.nombre}
                        </CardTitle>
                        <Badge color="success" className="fs-6 p-2">
                          ${platillo.precio.toFixed(2)}
                        </Badge>
                      </div>
                      <CardSubtitle className="mb-3 text-muted small">
                        🏷️ {platillo.categoria}
                      </CardSubtitle>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-muted">Disponibilidad:</span>
                        <Badge color={platillo.stock > 3 ? "info" : "warning"} pill>
                          {platillo.stock} unidades
                        </Badge>
                      </div>

                      {platillo.stock === 0 || reservaConfirmada ? (
                        <Button color="secondary" block disabled className="w-100">
                          {reservaConfirmada ? "Reserva Finalizada" : "Agotado"}
                        </Button>
                      ) : (
                        <Button color="primary" block className="w-100 fw-bold" onClick={() => añadirAForm(platillo.id)}>
                          + Añadir a la Reserva
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Carrito de Reserva */}
        <Col xs="12" lg="4">
          <div className="p-3 bg-light-sticky sticky-top shadow-sm" style={{ top: '20px' }}>
            <h5 className="mb-3 fw-bold border-bottom pb-2">🛒 Tu Bandeja</h5>
            {reserva.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="mb-0 fs-5">Bandeja vacía</p>
                <small>Selecciona platillos del menú para comenzar.</small>
              </div>
            ) : (
              <ListGroup flush className="rounded">
                {reserva.map((item) => {
                  const nombre = obtenerNombrePlatillo(item.id);
                  const precio = obtenerPrecioPlatillo(item.id);
                  return (
                    <ListGroupItem key={item.id} className="p-3 mb-2 border rounded shadow-sm bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark">{nombre}</span>
                        <span className="fw-bold text-success">
                          ${(precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <ButtonGroup size="sm">
                          <Button
                            color="outline-secondary"
                            onClick={() => actualizarPorciones(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1 || reservaConfirmada}
                          >
                            -
                          </Button>
                          <Button color="light" disabled className="text-dark fw-bold px-3">
                            {item.cantidad}
                          </Button>
                          <Button
                            color="outline-secondary"
                            onClick={() => actualizarPorciones(item.id, item.cantidad + 1)}
                            disabled={reservaConfirmada}
                          >
                            +
                          </Button>
                        </ButtonGroup>

                        <Button
                          color="outline-danger"
                          size="sm"
                          onClick={() => quitarDeReserva(item.id)}
                          disabled={reservaConfirmada}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;