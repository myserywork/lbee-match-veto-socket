import { Server } from 'socket.io';
import { socketFunctions } from './socketFunctions';
import {
  findRoom,
  insertMatchLog,
  checkIfisBanPhase,
  changeMatchTurn,
  beginChooseSidePhase,
  beginPickSidePhase,
  getTeamSideObject,
  checkMatchTurn,
  getTeamSideByToken,
  isUserAllowedToVeto,
  removeTeamTokenFromOutput,
  checkifIsTimeToChooseSide,
  checkIfisPickSidePhase,
} from './functions';

const io = new Server(3000);

export const rooms: any[] = [];
export const clients: any[] = [];

setInterval(() => {
  console.log(rooms);
}, 10000);

const endPickSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'end';
    rooms[rooms.indexOf(room)] = room;
    insertMatchLog(roomId, {
      type: 'matchEnd',
      message: 'Match Pick has ended',
    });
    socket.to(room.name).emit('pickSidePhaseEnded');
  }
};

export const checkMapAlreadyBanned = (room: any, map: string): boolean => {
  if (room.matchConfig.matchBannedMaps.includes(map)) {
    return true;
  }
  return false;
};

export const getCurrentDateWithPlusMileSecounds = (mileSecounds: number) => {
  const currentDate = new Date();
  const newDate = new Date(currentDate.getTime() + mileSecounds);
  return newDate;
};

io.on('connection', (socket) => {
  console.log('New connection', socket.id);

  if (socket.handshake.query.token) {
    clients.push({
      id: socket.id,
      token: socket.handshake.query.token,
    });
  }

  socket.on('checkMatchTurn', (roomId: string) => {
    const room = findRoom(roomId);
    if (room) {
      socket.emit('matchTurnChecked', room.matchConfig.matchTurn);
    }
  });

  socket.on('checkMatchPhase', (roomId: string) => {
    const room = findRoom(roomId);
    if (room) {
      socket.emit('matchPhaseChecked', room.matchConfig.matchPhase);
    }
  });

  socket.on('createRoom', (matchConfig) => {
    socketFunctions.createRoom(socket, matchConfig);
  });

  socket.on('joinRoom', (roomId) => {
    const room = findRoom(roomId);
    if (!room) {
      return socket.emit('roomNotFound', roomId);
    }

    if (isUserAllowedToVeto(socket, roomId)) {
      socket.join(roomId);
      const teamSide = getTeamSideByToken(socket, roomId);
      socket.emit('joinedRoom', [room, teamSide]);
    } else {
      socket.emit('notAllowedToJoinRoom');
    }
  });

  socket.on('showRoom', (roomId) => {
    const room = findRoom(roomId);
    if (!room) {
      return socket.emit('roomNotFound', roomId);
    }
    socket.emit('roomFound', removeTeamTokenFromOutput(room));
  });

  socket.on('banMap', (roomId, mapName) => {
    console.log('banMap', roomId, mapName);
    const room = findRoom(roomId);
    if (!room) {
      console.log('room not found');
      return socket.emit('roomNotFound', roomId);
    }
    if (!isUserAllowedToVeto(socket, roomId)) {
      console.log('not allowed to veto');
      return socket.emit('notAllowedToVeto');
    }

    if (!checkIfisBanPhase(room)) {
      console.log('not ban phase');
      return socket.emit('notBanPhase');
    }

    const teamSide = getTeamSideByToken(socket, roomId);

    if (checkMapAlreadyBanned(room, mapName)) {
      console.log('map already banned');
      return socket.emit('mapAlreadyBanned', mapName);
    }

    if (!checkMatchTurn(room, teamSide)) {
      console.log('not your turn');
      return socket.emit('notYourTurn');
    }

    console.log('banMap', roomId, mapName, teamSide);

    console.log(room);

    const alreadyBannedMapsCount = room.matchConfig.matchBannedMaps.length;

    if (alreadyBannedMapsCount >= room.matchMisc.maxBans) {
      console.log('max bans reached');
      beginPickSidePhase(socket, roomId);

      const notBannedMaps = room.matchConfig.matchMaps.filter(
        (map: any) => !room.matchConfig.matchBannedMaps.includes(map),
      );

      const pickeMapsObject = notBannedMaps.map((map: string) => {
        return {
          name: map,
          teamOneSide: '',
          teamTwoSide: '',
        };
      });

      room.matchConfig.matchPickedsMaps = pickeMapsObject;
      rooms[rooms.indexOf(room)] = room;

      return socket.emit('maxBansReached');
    }

    const teamSideObject = getTeamSideObject(room, teamSide);

    if (teamSide === 'teamOne') {
      room.matchConfig.matchTeamOne = {
        ...teamSideObject,
        banned: [...teamSideObject.banned, mapName],
      };
    } else if (teamSide === 'teamTwo') {
      room.matchConfig.matchTeamTwo = {
        ...teamSideObject,
        banned: [...teamSideObject.banned, mapName],
      };
    }

    const isTimeToChooseSide = checkifIsTimeToChooseSide(room);

    if (isTimeToChooseSide) {
      beginChooseSidePhase(socket, roomId);
    }

    room.matchConfig.matchBannedMaps.push(mapName);
    rooms[rooms.indexOf(room)] = room;
    changeMatchTurn(room);

    socket.to(room.name).emit('mapBanned', mapName);

    insertMatchLog(roomId, { type: 'ban', map: mapName, team: teamSide });
  });

  socket.on('pickSide', (roomId, mapName, side) => {
    console.log('pickSide', roomId, mapName, side);
    const room = findRoom(roomId);
    if (!room) {
      console.log('room not found');
      return socket.emit('roomNotFound', roomId);
    }
    if (!isUserAllowedToVeto(socket, roomId)) {
      console.log('not allowed to veto');
      return socket.emit('notAllowedToVeto');
    }

    const isPickTime = checkIfisPickSidePhase(room);

    if (!isPickTime) {
      console.log('not pick side phase');
      return socket.emit('notPickSidePhase');
    }

    const teamSide = getTeamSideByToken(socket, roomId);

    if (!checkMatchTurn(room, teamSide)) {
      console.log('not your turn');
      return socket.emit('notYourTurn');
    }

    const mapObject = room.matchConfig.matchPickedsMaps.find(
      (map: any) => map.name === mapName,
    );

    console.log({ mapObject: mapObject });

    if (mapObject.teamOneSide !== '' && mapObject.teamTwoSide !== '') {
      console.log('side already picked');
      return socket.emit('sideAlreadyPicked', mapName);
    }

    if (teamSide === 'teamOne') {
      mapObject.teamOneSide = side;
      mapObject.teamTwoSide = side === 'attack' ? 'defend' : 'attack';
    } else {
      mapObject.teamTwoSide = side;
      mapObject.teamOneSide = side === 'attack' ? 'defend' : 'attack';
    }

    room.matchConfig.matchPickedsMaps[
      room.matchConfig.matchPickedsMaps.indexOf(mapObject)
    ] = mapObject;

    rooms[rooms.indexOf(room)] = room;

    changeMatchTurn(room);

    insertMatchLog(roomId, {
      type: 'pick',
      map: mapName,
      team: teamSide,
      side,
    });

    const maps = room.matchConfig.matchPickedsMaps;
    const notSelected = maps.filter(
      (map: { teamOneSide: string; teamTwoSide: string }) =>
        map.teamOneSide === '' && map.teamTwoSide === '',
    );

    if (notSelected.length === 0) {
      endPickSidePhase(socket, roomId);
    }
  });
});

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
