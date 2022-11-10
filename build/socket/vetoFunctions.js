"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchVetoFunctions = void 0;
var server_1 = require("./server");
exports.matchVetoFunctions = {
    pickMap: function (socket, roomId, map) {
        var room = server_1.rooms.find(function (room) { return room.id === roomId; });
        if (room) {
            room.matchConfig.matchMaps.push(map);
            socket.to(room.name).emit('mapPicked', map);
        }
    },
};
