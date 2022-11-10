import { rooms } from './server';

export const socketFunctions = {
  createRoom: (socket: any, matchConfig: any) => {
    const room = rooms.find((room) => room.id === matchConfig.matchId);
    if (!room) {
      rooms.push({
        id: matchConfig.matchId,
        name: matchConfig.roomName,
        matchConfig,
      });
      socket.join(matchConfig.roomName);
      socket.emit('roomCreated', matchConfig.roomName);
    } else {
      socket.emit('roomAlreadyExists', matchConfig.roomName);
    }
  },
};
