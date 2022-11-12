import { createServer } from 'http';
import { Server } from 'socket.io';

import gameRoom from '../gameRoom';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

httpServer.listen(3000);

export const rooms: any[] = [];
export const clients: any[] = [];

setInterval(() => {
  console.log({ rooms: rooms, clients: clients });
}, 10000);

const broadcastToAll = (room: any, event: string, data: any) => {
  room.clients.forEach((client: any) => {
    client.emit(event, data);
  });
};

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
      io: socket,
    });
  }

  socket.on('joinRoom', (roomId) => {
    const room = findRoom(roomId);
    if (room) {
      const token = socket.handshake.query.token;
      const teamSide = getTeamSideByToken(token, roomId);

      socket.emit('joinedRoom', [room, teamSide]);
      console.log('joinedRoom', teamSide);
    }
  });

  socket.on('banMap', (roomId, mapName) => {
    const room = findRoom(roomId);
    if (room) {
      const teamSide = getTeamSideByToken(socket.handshake.query.token, roomId);
      room.banMap(mapName, teamSide);
      socket.emit('mapBanned', mapName);
      console.log('mapBanned', mapName);
    }
  });

  socket.on('pickMapSide', (roomId, mapName, side) => {
    const room = findRoom(roomId);
    if (room) {
      const teamSide = getTeamSideByToken(socket.handshake.query.token, roomId);
      room.pickMapSide(mapName, side, teamSide);
      socket.emit('mapSidePicked', mapName, side);
      console.log('mapSidePicked', mapName, side);
    }
  });

  socket.on('showRoom', (roomId) => {
    const room = findRoom(roomId);
    if (room) {
      (room.teamA.token = null),
        (room.teamB.token = null),
        socket.emit('roomShown', room);
      console.log('roomShown');
    }
  });
});

export const getTeamSideByToken = (
  token: string | string[] | undefined,
  roomId: string,
) => {
  const room = findRoom(roomId);
  if (room) {
    if (room.teamA.token === token) {
      return 'teamA';
    } else if (room.teamB.token === token) {
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
