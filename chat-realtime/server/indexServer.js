//Código del servidor utilizando Express y Socket.IO para manejar conexiones en tiempo real
//todo este codigo sirve para crear un servidor de chat en tiempo real utilizando Node.js, Express y Socket.IO.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Inicializamos el servidor Socket.IO sobre el servidor HTTP.
// Configuramos CORS para permitir cualquier origen durante el desarrollo local.
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Servimos los archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));


// Ruta principal para servir la interfaz del cliente chat
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

//Escuchamos las conexiones entrantes de Socket.IO
io.on('connection', (socket) => {
    //Cuando un cliente se conecta, se le asigna un ID único (socket.id).
    console.log(`\n Usuario conectado al servidor. Socket ID: ${socket.id}`);
    //Recibimos un mensaje de chat desde el cliente
 socket.on('message', (payload) => {
    console.log(`Mensaje recibido en el servidor desde [${payload.usuario}]: "${payload.texto}"`);
    
    //Validamos de forma básica el playload en el servidor antes de transmitirlo
    if (payload && typeof payload.usuario ==='string' && typeof payload.texto === 'string') {
        //Re-transmitimos el mensaje a TODOS los clientes conectados.
        io.emit('message',{
            usuario: payload.usuario,
            texto: payload.texto,
            socketId: socket.id, //Incluimos el ID del socket para referencia
            timestamp: new Date().toLocaleTimeString() //Agregamos una marca de tiempo al mensaje
        });
        console.log('Mensaje retransmitido a todos los clientes.');
    } else {
        console.warn('Se recibió un payload con formato inválido e ignorado.', payload);
    }
});
//Escuchamos el evento cuando un usuario escribe (para mostrar feedback visual)
socket.on('typing', (data) => {
    //Transmitimos a todos los clientes EXCEPTO ALQ QUE ESTA ESCRIBIENDO (USAMOS BROADCAST)
    socket.broadcast.emit('typing', data);
});
//Escuchamos el evento de desconexion del cliente
socket.on('disconnect', (reason) => {
    console.log(`Usuario desconectado del servidor. Socket ID: ${socket.id}. Motivo:${reason}`);
});
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`Servidor de Chat en vivo en http://localhost:${PORT}`);
    console.log(`==========================================\n`);
});