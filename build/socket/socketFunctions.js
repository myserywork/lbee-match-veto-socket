"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketFunctions = void 0;
var server_1 = require("./server");
exports.socketFunctions = {
    createRoom: function (socket, matchConfig) {
        var room = server_1.rooms.find(function (room) { return room.id === matchConfig.matchId; });
        if (!room) {
            server_1.rooms.push({
                id: matchConfig.matchId,
                name: matchConfig.roomName,
                matchConfig: matchConfig,
                matchMisc: {
                    maxBans: matchConfig.matchMaps.length - matchConfig.matchBo,
                    maxPicks: matchConfig.matchBo,
                    maxMaps: matchConfig.matchMaps.length,
                },
                matchLogs: [],
            });
            socket.join(matchConfig.roomName);
            socket.emit('roomCreated', matchConfig.roomName);
        }
        else {
            socket.emit('roomAlreadyExists', matchConfig.roomName);
        }
    },
};
