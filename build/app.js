"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./socket/server/server");
var client_1 = require("./socket/client/client");
var http_1 = require("./http/http");
http_1.http.listen(3333, function () { return console.log('Server is running on port 3333'); });
server_1.socketServer.emit('hello', 'world');
var roomId = 123456;
setTimeout(function () {
    client_1.socketClient.emit('joinRoom', roomId);
    client_1.socketClient2.emit('joinRoom', roomId);
    client_1.socketClient.emit('banMap', roomId, 'ascent');
    client_1.socketClient2.emit('banMap', roomId, 'bind');
}, 10000);
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
}, 1000);
