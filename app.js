const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const chatController = require('./src/controllers/chat-controller');

const app = express();
const server = http.createServer(app);

const io = new Server(server);

let users;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/privateChat/:id1/:id2', async (req, res) => {
  const id1 = req.params.id1;
  const id2 = req.params.id2;
  users = [id1, id2];

  try {
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (error) {
    console.error('Error al verificar el chat:', error);
    res.status(500).send('Error al verificar el chat');
  }
});

io.on('connection', async (socket) => {
  if (users !== undefined) {
    await chatController.checkChat(users);
    socket.userID = users[0];

    // Enviar el socket.userID al cliente recién conectado
    socket.emit('user connected', { userID: socket.userID });

    socket.on('chat message', async (data) => {
      const mensaje = data.mensaje;

      try {
        const result = await chatController.createMessage(users, mensaje); // Verifica que result.rows contenga los datos esperados

        // Emitir los campos individualmente
        io.emit('chat message', result.rows[0].content, result.rows[0].id.toString(), result.rows[0].sender_user, result.rows[0].date_sent, users[0]);
      } catch (error) {
        console.error('Error al crear mensaje:', error);
      }
    });

    if (!socket.recovered) {
      try {
        const results = await chatController.recoverChat(users);

        results.rows.forEach(row => {
          // Emitir los campos individualmente al cliente
          socket.emit('chat message', row.content, row.id.toString(), row.sender_user, row.date_sent, users[0]);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
