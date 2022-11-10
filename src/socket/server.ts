import { match } from 'assert';
import { Server } from 'socket.io';
import { socketFunctions } from './socketFunctions';
import { matchVetoFunctions } from './vetoFunctions';

const io = new Server(3000);

export const rooms: any[] = [];
export const clients: any[] = [];

setInterval(() => {
  console.log(rooms);
}, 10000);

const getToken = (socket: any) => {
  return socket.handshake.query.token;
};

const findRoom = (roomId: string) => {
  return rooms.find((room) => room.id === roomId);
};

const isUserAllowedToVeto = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  const token = getToken(socket);
  if (room) {
    if (
      room.matchConfig.matchTeamOne.token === token ||
      room.matchConfig.matchTeamTwo.token === token
    ) {
      return true;
    }
  }
  return false;
};

const removeTeamTokenFromOutput = (room: any) => {
  const { matchTeamOne, matchTeamTwo, ...rest } = room;
  return rest;
};

const getTeamSideByToken = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  const token = getToken(socket);
  if (room) {
    if (room.matchConfig.matchTeamOne.token === token) {
      return 'teamOne';
    } else if (room.matchConfig.matchTeamTwo.token === token) {
      return 'teamTwo';
    }
  }
  return '';
};

const checkMapAlreadyBanned = (room: any, map: string) => {
  if (room.matchConfig.matchBannedMaps.includes(map)) {
    return true;
  }
  return false;
};

const checkMatchTurn = (room: any, side: string) => {
  if (room.matchConfig.matchTurn === side) {
    return true;
  }
  return false;
};

const beginPickPhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'pick';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('pickPhaseStarted');
  }
};

const getTeamSideObject = (room: any, side: string) => {
  if (side === 'teamOne') {
    return room.matchConfig.matchTeamOne;
  } else if (side === 'teamTwo') {
    return room.matchConfig.matchTeamTwo;
  }
  return null;
};

const checkIfIsPickPhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'pick') {
    return true;
  }
  return false;
};

const checkIfisBanPhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'ban') {
    return true;
  }
  return false;
};

const getMatchTurn = (room: any) => {
  return room.matchConfig.matchTurn;
};

const changeMatchTurn = (room: any) => {
  if (room.matchConfig.matchTurn === 'teamOne') {
    room.matchConfig.matchTurn = 'teamTwo';
  } else if (room.matchConfig.matchTurn === 'teamTwo') {
    room.matchConfig.matchTurn = 'teamOne';
  }
  rooms[rooms.indexOf(room)] = room;
};

const beginChooseSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'chooseSide';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('chooseSidePhaseStarted');
  }
};

const checkMapAlreadyPicked = (room: any, map: string) => {
  const teamOneMaps = room.matchConfig.matchTeamOne.picked;
  const teamTwoMaps = room.matchConfig.matchTeamTwo.picked;
  if (teamOneMaps.includes(map) || teamTwoMaps.includes(map)) {
    return true;
  }
  return false;
};

const getMapMisc = (map: string) => {
  const mapMisc = {
    map_name: map,
    map_picture: 'https://i.imgur.com/0Z4Z4Zm.jpg',
    map_description: 'A map description',
  };
  return mapMisc;
};

const checkIfIsChooseSidePhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'chooseSide') {
    return true;
  }
  return false;
};

const checkifIsTimeToChooseSide = (room: any) => {
  if (room.matchConfig.matchMaps.length === room.matchConfig.matchBo) {
    return true;
  }
  return false;
};

const beginPickSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'pickSide';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('pickSidePhaseStarted');
  }
};

const insertMatchLog = (roomId: string, log: any) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchLogs.push(log);
    rooms[rooms.indexOf(room)] = room;
  }
};

const checkIfisPickSidePhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'pickSide') {
    return true;
  }
  return false;
};

const endPickSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'end';
    rooms[rooms.indexOf(room)] = room;
    insertMatchLog(roomId, {
      type: 'matchEnd',
      message: 'Match has ended',
    });
    socket.to(room.name).emit('pickSidePhaseEnded');
  }
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
