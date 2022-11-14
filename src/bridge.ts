import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

const app = express.default();

app.get('/info', (_req, res) => {
  res.send({ uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new socketio.Server(server);

io.on('connection', (...params) => {
  console.log(params);
});

server.listen(8080, () => {
  console.log('Running at localhost:8080');
});
