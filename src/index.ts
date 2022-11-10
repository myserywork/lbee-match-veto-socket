// eslint-disable-next-line no-console

import { socketServer, rooms } from './socket/server';
import { socketClient, socketClient2 } from './socket/client';

socketServer.emit('hello', 'world');

// fakes room creation

const randomString = Math.random().toString(36).substring(7);

const avaliableMaps = [
  'ascent',
  'bind',
  'breeze',
  'haven',
  'icebox',
  'split',
  'fracture',
  'pearl',
];

const alreadyBannedMaps = [];

const teamOne = {
  name: 'Team One',
  logo: 'https://i.imgur.com/1Q9Q1Zm.png',
  picked: [],
  banned: [],
  side: '',
  token: 'teamone',
};

const teamTwo = {
  name: 'Team Two',
  logo: 'https://i.imgur.com/1Q9Q1Zm.png',
  picked: [],
  banned: [],
  side: '',
  token: 'teamtwo',
};

const matchConfig = {
  matchId: randomString,
  roomName: randomString + ' Match Name',
  matchGameLogo: 'https://i.imgur.com/1Q9Q1Zm.png',
  matchGame: 'valorant',
  matchBo: 3,
  matchMaps: avaliableMaps,
  matchBannedMaps: [],
  matchPickedsMaps: [],
  matchTeamOne: teamOne,
  matchTeamTwo: teamTwo,
  matchTurn: 'teamOne',
  matchPhase: 'ban',
  matchLogs: [],
};

socketClient.emit('createRoom', matchConfig);

socketClient.emit('showRoom', randomString);
socketClient.emit('joinRoom', randomString);
socketClient.emit('showRoom', randomString);

socketClient2.emit('showRoom', randomString);
socketClient2.emit('joinRoom', randomString);
socketClient2.emit('showRoom', randomString);

setInterval(() => {
  console.clear();

  const room = rooms.find((room) => room.id === randomString);
  if (room) {
    console.log({
      miscConfig: room.matchMisc,
      bannedMapsCount: room.matchConfig.matchBannedMaps.length,
      pickedMapsCount: room.matchConfig.matchPickedsMaps.length,
      turn: room.matchConfig.matchTurn,
      phase: room.matchConfig.matchPhase,
      bannedMaps: room.matchConfig.matchBannedMaps,
      pickedMaps: room.matchConfig.matchPickedsMaps,
      avaliableMaps: room.matchConfig.matchMaps,
      matchLogs: room.matchLogs,
    });
  }

  const matchPhase = room.matchConfig.matchPhase;

  socketClient.emit('checkMatchTurn', randomString);
  socketClient.emit('checkMatchPhase', randomString);

  if (matchPhase === 'ban') {
    let map = avaliableMaps[Math.floor(Math.random() * avaliableMaps.length)];
    socketClient.emit('banMap', randomString, map);

    map = avaliableMaps[Math.floor(Math.random() * avaliableMaps.length)];
    socketClient2.emit('banMap', randomString, map);
  }

  if (matchPhase === 'pickSide') {
    const maps = room.matchConfig.matchPickedsMaps;
    const notSelected = maps.filter(
      (map: { teamOneSide: string; teamTwoSide: string }) =>
        map.teamOneSide === '' && map.teamTwoSide === '',
    );

    const randomMap =
      notSelected[Math.floor(Math.random() * notSelected.length)];

    const turn = room.matchConfig.matchTurn;

    console.log({ randomMap: randomMap });

    if (randomMap.name == null) {
      return;
    }

    if (turn === 'teamOne') {
      socketClient.emit('pickSide', randomString, randomMap.name, 'attack');
    } else {
      socketClient2.emit('pickSide', randomString, randomMap.name, 'attack');
    }
  }
}, 1000);
