const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//Datos en memoria

let menu = [
    {
        id: 101,
        nombre: "Menú Ejecutivo (Pollo)",
        precio: 5.50,
        stock: 12,
        categoria: "Fuerte"
    },
    {
        id: 102,
        nombre: "Menú Ejecutivo (Carne)",
        precio: 6.50,
        stock: 10,
        categoria: "Fuerte"
    },
    {
        id: 103,
        nombre: "Ensalada César",
        precio: 3.50,
        stock: 8,
        categoria: "Ensalada"
    },
    {
        id: 104,
        nombre: "Sopa del Día",
        precio: 2.50,
        stock: 15,
        categoria: "Sopa"
    },
    {
        id: 105,
        nombre: "Jugo Natural",
        precio: 1.50,
        stock: 20,
        categoria: "Bebida"
    }
];

let saldo = 25.00;

let reserva = [];

let reservaConfirmada = false;

function calcularTotal() {
    return reserva.reduce((total, item) => {
        const alimento = menu.find(a => a.id === item.id);

        if (!alimento) {
            return total;
        }

        return total + (alimento.precio * item.cantidad);
    }, 0);
}

//GET /api/menu

app.get("/api/menu", (req, res) => {
    res.json(menu);
});

//GET /api/reserva

app.get("/api/reserva", (req, res) => {
    res.json({
        saldo: saldo,
        itemsReservados: reserva,
        total: calcularTotal(),
        confirmada: reservaConfirmada
    });
});

//POST /api/reserva/agregar

app.post("/api/reserva/agregar", (req, res) => {
    const { alimentoId, cantidad } = req.body;

    if (reservaConfirmada) {
        return res.status(400).json({
            mensaje: "La reserva ya fue confirmada"
        });
    }

    if (
        !Number.isInteger(alimentoId) ||
        !Number.isInteger(cantidad) ||
        cantidad <= 0
    ) {
        return res.status(400).json({
            mensaje: "Datos inválidos"
        });
    }

    const alimento = menu.find(a => a.id === alimentoId);

    if (!alimento) {
        return res.status(404).json({
            mensaje: "Alimento no encontrado"
        });
    }

    const stockDisponible = alimento.stock >= cantidad;

    if (!stockDisponible) {
        return res.status(400).json({
            mensaje: "Stock insuficiente"
        });
    }

    const itemExistente = reserva.find(item => item.id === alimentoId);

    const nuevaCantidad = itemExistente
        ? itemExistente.cantidad + cantidad
        : cantidad;

    const nuevoTotal =
        calcularTotal() + (alimento.precio * cantidad);

    const saldoDisponible = nuevoTotal <= saldo;

    if (!saldoDisponible) {
        return res.status(400).json({
            mensaje: "Saldo insuficiente para esta cantidad"
        });
    }

    alimento.stock -= cantidad;

    if (itemExistente) {
        itemExistente.cantidad = nuevaCantidad;
    } else {
        reserva.push({
            id: alimentoId,
            cantidad: cantidad
        });
    }

    res.status(201).json({
        mensaje: "Alimento agregado a la reserva",
        itemsReservados: reserva,
        total: calcularTotal()
    });
});

//PUT /api/reserva/actualizar-porciones/:id

app.put("/api/reserva/actualizar-porciones/:id", (req, res) => {
    const alimentoId = parseInt(req.params.id);
    const { cantidad } = req.body;

    if (reservaConfirmada) {
        return res.status(400).json({
            mensaje: "La reserva ya fue confirmada"
        });
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            mensaje: "La cantidad debe ser un número entero mayor que 0"
        });
    }

    const itemReserva = reserva.find(item => item.id === alimentoId);

    if (!itemReserva) {
        return res.status(404).json({
            mensaje: "El alimento no está en la reserva"
        });
    }

    const alimento = menu.find(a => a.id === alimentoId);

    if (!alimento) {
        return res.status(404).json({
            mensaje: "Alimento no encontrado"
        });
    }

    const cantidadAnterior = itemReserva.cantidad;
    const diferencia = cantidad - cantidadAnterior;

    if (diferencia > 0) {

        const stockDisponible = alimento.stock >= diferencia;

        if (!stockDisponible) {
            return res.status(400).json({
                mensaje: "Stock insuficiente"
            });
        }

        const nuevoTotal =
            calcularTotal() + (alimento.precio * diferencia);

        // BOOLEAN
        const saldoDisponible = nuevoTotal <= saldo;

        if (!saldoDisponible) {
            return res.status(400).json({
                mensaje: "Saldo insuficiente para esta cantidad"
            });
        }

        alimento.stock -= diferencia;
    }

    if (diferencia < 0) {
        alimento.stock += Math.abs(diferencia);
    }

    itemReserva.cantidad = cantidad;

    res.json({
        mensaje: "Cantidad actualizada",
        itemsReservados: reserva,
        total: calcularTotal()
    });
});

//DELETE /api/reserva/eliminar/:id

app.delete("/api/reserva/eliminar/:id", (req, res) => {
    const alimentoId = parseInt(req.params.id);

    if (reservaConfirmada) {
        return res.status(400).json({
            mensaje: "La reserva ya fue confirmada"
        });
    }

    const indice = reserva.findIndex(item => item.id === alimentoId);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "El alimento no está en la reserva"
        });
    }

    const itemEliminado = reserva[indice];

    const alimento = menu.find(a => a.id === alimentoId);

    if (alimento) {
        alimento.stock += itemEliminado.cantidad;
    }

    reserva.splice(indice, 1);

    res.json({
        mensaje: "Alimento eliminado de la reserva",
        itemsReservados: reserva,
        total: calcularTotal()
    });
});

//POST /api/reserva/confirmar

app.post("/api/reserva/confirmar", (req, res) => {

    if (reservaConfirmada) {
        return res.status(400).json({
            mensaje: "La reserva ya fue confirmada"
        });
    }

    if (reserva.length === 0) {
        return res.status(400).json({
            mensaje: "No hay alimentos en la reserva"
        });
    }

    const total = calcularTotal();

    const saldoDisponible = total <= saldo;

    if (!saldoDisponible) {
        return res.status(400).json({
            mensaje: "Saldo insuficiente para confirmar la reserva"
        });
    }

    //Se descuenta el saldo
    saldo -= total;

    //La reserva se confirma
    reservaConfirmada = true;

    res.json({
        mensaje: "Reserva confirmada correctamente",
        saldo: saldo,
        itemsReservados: reserva,
        total: total,
        confirmada: reservaConfirmada
    });
});

//Iniciar servidor

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});