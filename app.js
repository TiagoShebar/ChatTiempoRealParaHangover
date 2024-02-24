const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


let nextUserID = 1; // Inicializamos el contador

io.on('connection', (socket) => {
  socket.userID = nextUserID++; // Asignamos el ID y luego incrementamos

  // Enviar el socket.userID al cliente recién conectado
  socket.emit('user connected', { userID: socket.userID });
  socket.on('chat message', (data) => {
    const id = data.userID;
    const mensaje = data.mensaje;
    // console.log(id);

    io.emit('chat message', { msg: mensaje, userID: id });
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});