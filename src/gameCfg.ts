import { mapsObject } from './utils';

const teamA = {
  name: 'Team One',
  logo: 'https://i.imgur.com/1Q9Q1Zm.png',
  picked: [],
  banned: [],
  side: '',
  token: 'teamA',
};

const teamTwo = {
  name: 'Team Two',
  logo: 'https://i.imgur.com/1Q9Q1Zm.png',
  picked: [],
  banned: [],
  side: '',
  token: 'teamtwo',
};

const avaliableMaps = mapsObject;
const interval = 20;
export const gameCfg = {
  teamA: teamA,
  teamTwo: teamTwo,
  game: 'valorant',
  matchesCount: 3,
  matchId: '123456',
  maps: avaliableMaps,
  matchTurnInterval: interval * 1000,
  logo: 'https://i.imgur.com/1Q9Q1Zm.png',
};
