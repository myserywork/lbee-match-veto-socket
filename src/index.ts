// eslint-disable-next-line no-console

import { socketServer } from './socket/server';
import { socketClient } from './socket/client';

socketServer.emit('hello', 'world');

// fakes room creation

const randomString = Math.random().toString(36).substring(7);

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
  matchMaps: [
    'ascent',
    'bind',
    'breeze',
    'haven',
    'icebox',
    'split',
    'fracture',
    'pearl',
  ],
  matchBannedMaps: [],
  matchTeamOne: teamOne,
  matchTeamTwo: teamTwo,
  matchTurn: 'teamOne',
  matchPhase: 'ban',
};

socketClient.emit('createRoom', matchConfig);

socketClient.emit('showRoom', randomString);
socketClient.emit('joinRoom', randomString);
socketClient.emit('showRoom', randomString);

setInterval(() => {
  socketClient.emit('banMap', randomString, 'ascent');
  socketClient.emit('checkMatchTurn', randomString);
  socketClient.emit('checkMatchPhase', randomString);
}, 1000);
