import * as socketio from 'socket.io';
import gameRoom from '../gameRoom';
import { httpServer } from '../../http/http';
import * as http from 'http';
import cors from 'cors';

httpServer.use(cors());
const server = http.createServer(httpServer);

const io = new socketio.Server(server, {
  cors: {
    origin: '*',
  },
});

export const rooms: any[] = [];
export const clients: any[] = [];

setInterval(() => {
  console.log({ rooms: rooms, clients: clients });
}, 10000);

const killInactiveSockets = () => {
  clients.forEach((client: any) => {
    if (client.disconnected) {
      const clientIndex = clients.indexOf(client);
      clients.splice(clientIndex, 1);
    }
  });
};

setInterval(() => {
  killInactiveSockets();
}, 10000);

io.on('connection', (socket) => {
  console.log('New connection', socket.id);

  if (socket.handshake.query.token) {
    clients.push({
      id: socket.id,
      token: socket.handshake.query.token,
      roomId: socket.handshake.query.roomId,
      io: socket,
    });
  }

  socket.on('joinRoom', (roomId) => {
    const room = findRoom(roomId);
    if (room) {
      socket.join(room.name);
      const token = socket.handshake.query.token;
      const teamSide = getTeamSideByToken(token, roomId);
      socket.emit('joinedRoom', [room, teamSide]);
      console.log('joinedRoom', teamSide);
    } else {
      socket.emit('roomNotFound');
    }

    setInterval(() => {
      const filteredClientsInRoom = clients.filter(
        (client) => client.roomId === socket.handshake.query.roomId,
      );

      for (let i = 0; i < filteredClientsInRoom.length; i++) {
        filteredClientsInRoom[i].io.emit('roomShown', room);
      }
    }, 1000);
  });

  socket.on('banMap', (roomId, mapName) => {
    mapName = mapName.toLowerCase();
    const room = findRoom(roomId);
    if (room) {
      const teamSide = getTeamSideByToken(socket.handshake.query.token, roomId);
      const bannedRoom = room.banMap(mapName, teamSide);
      if (bannedRoom) {
        socket.emit('mapBanned', mapName);
      } else {
        socket.emit('mapNOTBanned', mapName);
      }
    } else {
      socket.emit('roomNotFound');
    }
  });

  socket.on('pickMapSide', (roomId, mapName, side) => {
    mapName = mapName.toLowerCase();

    const room = findRoom(roomId);
    if (room) {
      const teamSide = getTeamSideByToken(socket.handshake.query.token, roomId);
      const pickMapSide = room.pickMapSide(mapName, teamSide, side);
      if (pickMapSide) {
        socket.emit('mapPicked', mapName);
      } else {
        socket.emit('mapNOTPicked', mapName);
      }
    } else {
      socket.emit('roomNotFound');
    }
  });

  socket.on('showRoom', (roomId) => {
    const room = findRoom(roomId);
    if (room) {
      socket.emit('roomShown', room);
    } else {
      socket.emit('roomNotFound');
    }
  });
});

export const getTeamSideByToken = (
  token: string | string[] | undefined,
  roomId: string,
) => {
  const room = findRoom(roomId);
  if (room) {
    if (room.teamA.token == token) {
      return 'teamA';
    } else if (room.teamB.token == token) {
      return 'teamB';
    }
  }
  return '';
};
export const createRoom = (matchConfig: any) => {
  const room = new gameRoom(matchConfig);
  rooms.push(room);
};

export const findRoom = (roomId: string) => {
  return rooms.find((room) => room.id === roomId);
};

export const socketServer = io;
server.listen(8080, () => console.log('Server is running on port 8080'));

/* depois da ação de banir, adicionar ao objeto o tempo maximo até a proxima ação
tempo de agora + o tempo maximo configurado
após isso, gerar um Job para verificar se o tempo maximo foi atingido com um setTimeout,
caso o turno ainda não tenha sido trocado, trocar o turno e banir automaticamente um mapa aleatório.
depois da ação de pick, adicionar ao objeto o tempo maximo até a proxima ação
tempo de agora + o tempo maximo configurado
após isso, gerar um Job para verificar se o tempo maximo foi atingido com um setTimeout,
caso o turno ainda não tenha sido trocado, trocar o turno e banir automaticamente um mapa aleatório.
*/

/* criar um endpoint para ver o objeto da sala */
/* criar um endpoint para criar uma room */
