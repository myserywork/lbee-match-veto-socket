"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./socket/server/server");
server_1.socketServer.emit('hello', 'world');
var roomId = '123456';
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
