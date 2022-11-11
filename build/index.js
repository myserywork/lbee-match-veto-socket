"use strict";
// eslint-disable-next-line no-console
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./socket/server/server");
var client_1 = require("./socket/client/client");
server_1.socketServer.emit('hello', 'world');
// fakes room creation
var randomString = Math.random().toString(36).substring(7);
var avaliableMaps = [
    'ascent',
    'bind',
    'breeze',
    'haven',
    'icebox',
    'split',
    'fracture',
    'pearl',
];
var alreadyBannedMaps = [];
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
    matchMaps: avaliableMaps,
    matchBannedMaps: [],
    matchPickedsMaps: [],
    matchTeamOne: teamOne,
    matchTeamTwo: teamTwo,
    matchTurn: 'teamOne',
    matchPhase: 'ban',
    matchLogs: [],
    timebetweenPhases: 20000,
    nextPhaseTimeout: null,
};
client_1.socketClient.emit('createRoom', matchConfig);
client_1.socketClient.emit('showRoom', randomString);
client_1.socketClient.emit('joinRoom', randomString);
client_1.socketClient.emit('showRoom', randomString);
client_1.socketClient2.emit('showRoom', randomString);
client_1.socketClient2.emit('joinRoom', randomString);
client_1.socketClient2.emit('showRoom', randomString);
setInterval(function () {
    console.clear();
    var room = server_1.rooms.find(function (room) { return room.id === randomString; });
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
    var matchPhase = room.matchConfig.matchPhase;
    client_1.socketClient.emit('checkMatchTurn', randomString);
    client_1.socketClient.emit('checkMatchPhase', randomString);
    if (matchPhase === 'ban') {
        var map = avaliableMaps[Math.floor(Math.random() * avaliableMaps.length)];
        client_1.socketClient.emit('banMap', randomString, map);
        map = avaliableMaps[Math.floor(Math.random() * avaliableMaps.length)];
        client_1.socketClient2.emit('banMap', randomString, map);
    }
    if (matchPhase === 'pickSide') {
        var maps = room.matchConfig.matchPickedsMaps;
        var notSelected = maps.filter(function (map) {
            return map.teamOneSide === '' && map.teamTwoSide === '';
        });
        var randomMap = notSelected[Math.floor(Math.random() * notSelected.length)];
        var turn = room.matchConfig.matchTurn;
        console.log({ randomMap: randomMap });
        if (randomMap.name == null) {
            return;
        }
        if (turn === 'teamOne') {
            client_1.socketClient.emit('pickSide', randomString, randomMap.name, 'attack');
        }
        else {
            client_1.socketClient2.emit('pickSide', randomString, randomMap.name, 'attack');
        }
    }
}, 1000);
