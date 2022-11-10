import { rooms } from './server';

export const matchVetoFunctions = {
  pickMap: (socket: any, roomId: string, map: string) => {
    const room = rooms.find((room) => room.id === roomId);
    if (room) {
      room.matchConfig.matchMaps.push(map);
      socket.to(room.name).emit('mapPicked', map);
    }
  },
};
