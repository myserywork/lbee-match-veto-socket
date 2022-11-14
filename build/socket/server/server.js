"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.findRoom = exports.createRoom = exports.getTeamSideByToken = exports.clients = exports.rooms = void 0;
var socketio = __importStar(require("socket.io"));
var gameRoom_1 = __importDefault(require("../gameRoom"));
var http_1 = require("../../http/http");
var http = __importStar(require("http"));
var cors_1 = __importDefault(require("cors"));
http_1.httpServer.use((0, cors_1.default)());
var server = http.createServer(http_1.httpServer);
var io = new socketio.Server(server, {
    cors: {
        origin: '*',
    },
});
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
server.listen(8080, function () { return console.log('Server is running on port 8080'); });
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
