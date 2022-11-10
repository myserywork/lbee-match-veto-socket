"use strict";
// eslint-disable-next-line no-console
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./socket/server");
var client_1 = require("./socket/client");
server_1.socketServer.emit('hello', 'world');
// fakes room creation
var randomString = Math.random().toString(36).substring(7);
var teamOne = {
    name: 'Team One',
    logo: 'https://i.imgur.com/1Q9Q1Zm.png',
    picked: [],
    banned: [],
    side: '',
    token: 'teamone',
};
var teamTwo = {
    name: 'Team Two',
    logo: 'https://i.imgur.com/1Q9Q1Zm.png',
    picked: [],
    banned: [],
    side: '',
    token: 'teamtwo',
};
var matchConfig = {
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
client_1.socketClient.emit('createRoom', matchConfig);
client_1.socketClient.emit('showRoom', randomString);
client_1.socketClient.emit('joinRoom', randomString);
client_1.socketClient.emit('showRoom', randomString);
setInterval(function () {
    client_1.socketClient.emit('banMap', randomString, 'ascent');
    client_1.socketClient.emit('checkMatchTurn', randomString);
    client_1.socketClient.emit('checkMatchPhase', randomString);
}, 1000);
