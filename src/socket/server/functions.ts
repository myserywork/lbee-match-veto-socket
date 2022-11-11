import { rooms } from './server';

export const getToken = (socket: any) => {
  return socket.handshake.query.token;
};

export const findRoom = (roomId: string) => {
  return rooms.find((room: { id: string }) => room.id === roomId);
};

export const isUserAllowedToVeto = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  const token = getToken(socket);
  if (room) {
    if (
      room.matchConfig.matchTeamA.token === token ||
      room.matchConfig.matchTeamB.token === token
    ) {
      return true;
    }
  }
  return false;
};

export const removeTeamTokenFromOutput = (room: any) => {
  const { matchTeamA, matchTeamB, ...rest } = room;
  return rest;
};

export const getTeamSideByToken = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  const token = getToken(socket);
  if (room) {
    if (room.matchConfig.matchTeamA.token === token) {
      return 'teamA';
    } else if (room.matchConfig.matchTeamB.token === token) {
      return 'teamB';
    }
  }
  return '';
};

export const checkMatchTurn = (room: any, side: string) => {
  if (room.matchConfig.matchTurn === side) {
    return true;
  }
  return false;
};

export const beginPickPhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'pick';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('pickPhaseStarted');
  }
};

export const getTeamSideObject = (room: any, side: string) => {
  if (side === 'teamA') {
    return room.matchConfig.matchTeamA;
  } else if (side === 'teamB') {
    return room.matchConfig.matchTeamB;
  }
  return null;
};

export const checkIfIsPickPhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'pick') {
    return true;
  }
  return false;
};

export const checkIfisBanPhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'ban') {
    return true;
  }
  return false;
};

export const getMatchTurn = (room: any) => {
  return room.matchConfig.matchTurn;
};

export const changeMatchTurn = (room: any) => {
  if (room.matchConfig.matchTurn === 'teamA') {
    room.matchConfig.matchTurn = 'teamB';
  } else if (room.matchConfig.matchTurn === 'teamB') {
    room.matchConfig.matchTurn = 'teamA';
  }
  rooms[rooms.indexOf(room)] = room;
};

export const beginChooseSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'chooseSide';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('chooseSidePhaseStarted');
  }
};

export const checkMapAlreadyPicked = (room: any, map: string) => {
  const teamAMaps = room.matchConfig.matchTeamA.picked;
  const teamBMaps = room.matchConfig.matchTeamB.picked;
  if (teamAMaps.includes(map) || teamBMaps.includes(map)) {
    return true;
  }
  return false;
};

export const checkIfIsChooseSidePhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'chooseSide') {
    return true;
  }
  return false;
};

export const checkifIsTimeToChooseSide = (room: any) => {
  if (room.matchConfig.matchMaps.length === room.matchConfig.matchBo) {
    return true;
  }
  return false;
};

export const beginPickSidePhase = (socket: any, roomId: string) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchConfig.matchPhase = 'pickSide';
    rooms[rooms.indexOf(room)] = room;
    socket.to(room.name).emit('pickSidePhaseStarted');
  }
};

export const insertMatchLog = (roomId: string, log: any) => {
  const room = findRoom(roomId);
  if (room) {
    room.matchLogs.push({ log: log, time: new Date() });
    rooms[rooms.indexOf(room)] = room;
  }
};

export const checkIfisPickSidePhase = (room: any) => {
  if (room.matchConfig.matchPhase === 'pickSide') {
    return true;
  }
  return false;
};
