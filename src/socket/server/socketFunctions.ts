import { match } from 'assert';
import { rooms } from './server';

export const socketFunctions = {
  createRoom: (socket: any, matchConfig: any) => {
    const room = rooms.find((room) => room.id === matchConfig.matchId);
    if (!room) {
      rooms.push({
        id: matchConfig.matchId,
        name: matchConfig.roomName,
        matchConfig,
        matchMisc: {
          maxBans: matchConfig.matchMaps.length - matchConfig.matchBo,
          maxPicks: matchConfig.matchBo,
          maxMaps: matchConfig.matchMaps.length,
          nextActionConvertedTimeToptBr: (
            matchConfig.timebetweenPhases / 1000
          ).toLocaleString('pt-BR'),
        },
        matchLogs: [],
      });

      socket.join(matchConfig.roomName);
      socket.emit('roomCreated', matchConfig.roomName);
    } else {
      socket.emit('roomAlreadyExists', matchConfig.roomName);
    }
  },
};
