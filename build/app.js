"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./socket/server/server");
var http_1 = require("./http/http");
http_1.http.listen(3333, function () { return console.log('Server is running on port 3333'); });
server_1.socketServer.emit('hello', 'world');
var roomId = '123456';
/*
const roomCfg =
  '{"game":"valorant","matchTurnInterval":20000,"matchesCount":3,"matchId":"123456","teamA":{"name":"TeamA","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"teamB":{"name":"TeamB","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"maps":{"ascent":{"name":"Ascent","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"bind":{"name":"Bind","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"breeze":{"name":"Breeze","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"haven":{"name":"Haven","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"icebox":{"name":"Icebox","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"split":{"name":"Split","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"fracture":{"name":"Fracture","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"},"pearl":{"name":"Pearl","picture":"https://credimotors.com.br/cdn/valorant/ascent.png"}},"picture":"https://credimotors.com.br/cdn/valorant/ascent.png"}';

const room = createRoom(JSON.parse(roomCfg));

setTimeout(() => {
  socketClient.emit('joinRoom', roomId);
  socketClient2.emit('joinRoom', roomId);

  socketClient.emit('banMap', roomId, 'ascent');
  socketClient2.emit('banMap', roomId, 'bind');
}, 10000);
*/
setInterval(function () {
    var gameRoom = server_1.rooms.find(function (room) { return room.id === roomId; });
    console.log({
        runningSetInterval: true,
        gameRoom: gameRoom,
        roomId: roomId,
        rooms: server_1.rooms,
    });
    if (gameRoom) {
        var actionTime = gameRoom.getAutoActionTime();
        var currentTime = new Date().getTime();
        console.clear();
        console.log({
            phase: gameRoom.currentPhase,
            turn: gameRoom.currentTurn,
            avaliableMaps: gameRoom.avaliableMaps,
            bannedMaps: gameRoom.getBannedMaps(),
            pickedMaps: gameRoom.getPickedMaps(),
            nextActionTime: actionTime.toLocaleString('pt-BR'),
            currentTime: new Date(currentTime).toLocaleString('pt-BR'),
            timeLeftObj: gameRoom.timeLeft,
            logs: gameRoom.logs,
        });
        if (gameRoom.currentPhase == 'finished') {
            console.log({
                finished: true,
                maps: gameRoom.getResultPickedMaps(),
            });
        }
    }
}, 500000);
