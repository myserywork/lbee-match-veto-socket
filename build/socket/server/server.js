"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.findRoom = exports.createRoom = exports.getTeamSideByToken = exports.clients = exports.rooms = void 0;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var gameRoom_1 = __importDefault(require("../gameRoom"));
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    },
});
httpServer.listen(3000);
exports.rooms = [];
exports.clients = [];
setInterval(function () {
    console.log({ rooms: exports.rooms, clients: exports.clients });
}, 10000);
var killInactiveSockets = function () {
    exports.clients.forEach(function (client) {
        if (client.disconnected) {
            var clientIndex = exports.clients.indexOf(client);
            exports.clients.splice(clientIndex, 1);
        }
    });
};
setInterval(function () {
    killInactiveSockets();
}, 10000);
io.on('connection', function (socket) {
    console.log('New connection', socket.id);
    if (socket.handshake.query.token) {
        exports.clients.push({
            id: socket.id,
            token: socket.handshake.query.token,
            roomId: socket.handshake.query.roomId,
            io: socket,
        });
    }
    socket.on('joinRoom', function (roomId) {
        var room = (0, exports.findRoom)(roomId);
        if (room) {
            socket.join(room.name);
            var token = socket.handshake.query.token;
            var teamSide = (0, exports.getTeamSideByToken)(token, roomId);
            socket.emit('joinedRoom', [room, teamSide]);
            console.log('joinedRoom', teamSide);
        }
        else {
            socket.emit('roomNotFound');
        }
        setInterval(function () {
            var filteredClientsInRoom = exports.clients.filter(function (client) { return client.roomId === socket.handshake.query.roomId; });
            for (var i = 0; i < filteredClientsInRoom.length; i++) {
                filteredClientsInRoom[i].io.emit('roomShown', room);
            }
        }, 1000);
    });
    socket.on('banMap', function (roomId, mapName) {
        mapName = mapName.toLowerCase();
        var room = (0, exports.findRoom)(roomId);
        if (room) {
            var teamSide = (0, exports.getTeamSideByToken)(socket.handshake.query.token, roomId);
            var bannedRoom = room.banMap(mapName, teamSide);
            if (bannedRoom) {
                socket.emit('mapBanned', mapName);
            }
            else {
                socket.emit('mapNOTBanned', mapName);
            }
        }
        else {
            socket.emit('roomNotFound');
        }
    });
    socket.on('pickMapSide', function (roomId, mapName, side) {
        mapName = mapName.toLowerCase();
        var room = (0, exports.findRoom)(roomId);
        if (room) {
            var teamSide = (0, exports.getTeamSideByToken)(socket.handshake.query.token, roomId);
            var pickMapSide = room.pickMapSide(mapName, teamSide, side);
            if (pickMapSide) {
                socket.emit('mapPicked', mapName);
            }
            else {
                socket.emit('mapNOTPicked', mapName);
            }
        }
        else {
            socket.emit('roomNotFound');
        }
    });
    socket.on('showRoom', function (roomId) {
        var room = (0, exports.findRoom)(roomId);
        if (room) {
            socket.emit('roomShown', room);
        }
        else {
            socket.emit('roomNotFound');
        }
    });
});
var getTeamSideByToken = function (token, roomId) {
    var room = (0, exports.findRoom)(roomId);
    if (room) {
        if (room.teamA.token == token) {
            return 'teamA';
        }
        else if (room.teamB.token == token) {
            return 'teamB';
        }
    }
    return '';
};
exports.getTeamSideByToken = getTeamSideByToken;
var createRoom = function (matchConfig) {
    var room = new gameRoom_1.default(matchConfig);
    exports.rooms.push(room);
};
exports.createRoom = createRoom;
var findRoom = function (roomId) {
    return exports.rooms.find(function (room) { return room.id === roomId; });
};
exports.findRoom = findRoom;
exports.socketServer = io;
/* depois da ação de banir, adicionar ao objeto o tempo maximo até a proxima ação
tempo de agora + o tempo maximo configurado
após isso, gerar um Job para verificar se o tempo maximo foi atingido com um setTimeout,
caso o turno ainda não tenha sido trocado, trocar o turno e banir automaticamente um mapa aleatório.
depois da ação de pick, adicionar ao objeto o tempo maximo até a proxima ação
tempo de agora + o tempo maximo configurado
após isso, gerar um Job para verificar se o tempo maximo foi atingido com um setTimeout,
caso o turno ainda não tenha sido trocado, trocar o turno e banir automaticamente um mapa aleatório.
*/
/* criar um endpoint para ver o objeto da sala */
/* criar um endpoint para criar uma room */
