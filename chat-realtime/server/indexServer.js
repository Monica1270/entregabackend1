//Código del servidor utilizando Express y Socket.IO para manejar conexiones en tiempo real76
const express = require('express');
const http = require('http');
const{ Server } = require('socket.io');
import {io}from 'socket.io-client';

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: '*',
    }     
});
const socket = io('http://localhost:3000');




app.use(express.static('public'));
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
});

server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});