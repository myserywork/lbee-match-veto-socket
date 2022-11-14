"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameCfg = void 0;
var utils_1 = require("./utils");
var teamA = {
    name: 'Team One',
    logo: 'https://i.imgur.com/1Q9Q1Zm.png',
    picked: [],
    banned: [],
    side: '',
    token: 'teamA',
};
var teamTwo = {
    name: 'Team Two',
    logo: 'https://i.imgur.com/1Q9Q1Zm.png',
    picked: [],
    banned: [],
    side: '',
    token: 'teamtwo',
};
var avaliableMaps = utils_1.mapsObject;
var interval = 20;
exports.gameCfg = {
    teamA: teamA,
    teamTwo: teamTwo,
    game: 'valorant',
    matchesCount: 3,
    matchId: '123456',
    maps: avaliableMaps,
    matchTurnInterval: interval * 1000,
    logo: 'https://i.imgur.com/1Q9Q1Zm.png',
};
