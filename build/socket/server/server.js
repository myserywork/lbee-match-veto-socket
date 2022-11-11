"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.setNextPhaseTimeout = exports.getCurrentDateWithPlusMileSecounds = exports.checkMapAlreadyBanned = exports.clients = exports.rooms = void 0;
var socket_io_1 = require("socket.io");
var socketFunctions_1 = require("./socketFunctions");
var functions_1 = require("./functions");
var io = new socket_io_1.Server(3000);
exports.rooms = [];
exports.clients = [];
setInterval(function () {
    console.log(exports.rooms);
}, 10000);
var endPickSidePhase = function (socket, roomId) {
    var room = (0, functions_1.findRoom)(roomId);
    if (room) {
        room.matchConfig.matchPhase = 'end';
        exports.rooms[exports.rooms.indexOf(room)] = room;
        (0, functions_1.insertMatchLog)(roomId, {
            type: 'matchEnd',
            message: 'Match Pick has ended',
        });
        socket.to(room.name).emit('pickSidePhaseEnded');
    }
};
var checkMapAlreadyBanned = function (room, map) {
    if (room.matchConfig.matchBannedMaps.includes(map)) {
        return true;
    }
    return false;
};
exports.checkMapAlreadyBanned = checkMapAlreadyBanned;
var getCurrentDateWithPlusMileSecounds = function (mileSecounds) {
    var currentDate = new Date();
    var newDate = new Date(currentDate.getTime() + mileSecounds);
    return newDate;
};
exports.getCurrentDateWithPlusMileSecounds = getCurrentDateWithPlusMileSecounds;
var setNextPhaseTimeout = function (roomId) {
    var room = (0, functions_1.findRoom)(roomId);
    if (room) {
        room.matchConfig.nextPhaseTimeout =
            (0, exports.getCurrentDateWithPlusMileSecounds)(10000);
        exports.rooms[exports.rooms.indexOf(room)] = room;
    }
};
exports.setNextPhaseTimeout = setNextPhaseTimeout;
io.on('connection', function (socket) {
    console.log('New connection', socket.id);
    if (socket.handshake.query.token) {
        exports.clients.push({
            id: socket.id,
            token: socket.handshake.query.token,
        });
    }
    socket.on('checkMatchTurn', function (roomId) {
        var room = (0, functions_1.findRoom)(roomId);
        if (room) {
            socket.emit('matchTurnChecked', room.matchConfig.matchTurn);
        }
    });
    socket.on('checkMatchPhase', function (roomId) {
        var room = (0, functions_1.findRoom)(roomId);
        if (room) {
            socket.emit('matchPhaseChecked', room.matchConfig.matchPhase);
        }
    });
    socket.on('createRoom', function (matchConfig) {
        socketFunctions_1.socketFunctions.createRoom(socket, matchConfig);
    });
    socket.on('joinRoom', function (roomId) {
        var room = (0, functions_1.findRoom)(roomId);
        if (!room) {
            return socket.emit('roomNotFound', roomId);
        }
        if ((0, functions_1.isUserAllowedToVeto)(socket, roomId)) {
            socket.join(roomId);
            var teamSide = (0, functions_1.getTeamSideByToken)(socket, roomId);
            socket.emit('joinedRoom', [room, teamSide]);
        }
        else {
            socket.emit('notAllowedToJoinRoom');
        }
    });
    socket.on('showRoom', function (roomId) {
        var room = (0, functions_1.findRoom)(roomId);
        if (!room) {
            return socket.emit('roomNotFound', roomId);
        }
        socket.emit('roomFound', (0, functions_1.removeTeamTokenFromOutput)(room));
    });
    socket.on('banMap', function (roomId, mapName) {
        console.log('banMap', roomId, mapName);
        var room = (0, functions_1.findRoom)(roomId);
        if (!room) {
            console.log('room not found');
            return socket.emit('roomNotFound', roomId);
        }
        if (!(0, functions_1.isUserAllowedToVeto)(socket, roomId)) {
            console.log('not allowed to veto');
            return socket.emit('notAllowedToVeto');
        }
        if (!(0, functions_1.checkIfisBanPhase)(room)) {
            console.log('not ban phase');
            return socket.emit('notBanPhase');
        }
        var teamSide = (0, functions_1.getTeamSideByToken)(socket, roomId);
        if ((0, exports.checkMapAlreadyBanned)(room, mapName)) {
            console.log('map already banned');
            return socket.emit('mapAlreadyBanned', mapName);
        }
        if (!(0, functions_1.checkMatchTurn)(room, teamSide)) {
            console.log('not your turn');
            return socket.emit('notYourTurn');
        }
        console.log('banMap', roomId, mapName, teamSide);
        console.log(room);
        var alreadyBannedMapsCount = room.matchConfig.matchBannedMaps.length;
        if (alreadyBannedMapsCount >= room.matchMisc.maxBans) {
            console.log('max bans reached');
            (0, functions_1.beginPickSidePhase)(socket, roomId);
            var notBannedMaps = room.matchConfig.matchMaps.filter(function (map) { return !room.matchConfig.matchBannedMaps.includes(map); });
            var pickeMapsObject = notBannedMaps.map(function (map) {
                return {
                    name: map,
                    teamOneSide: '',
                    teamTwoSide: '',
                };
            });
            room.matchConfig.matchPickedsMaps = pickeMapsObject;
            exports.rooms[exports.rooms.indexOf(room)] = room;
            return socket.emit('maxBansReached');
        }
        var teamSideObject = (0, functions_1.getTeamSideObject)(room, teamSide);
        if (teamSide === 'teamOne') {
            room.matchConfig.matchTeamOne = __assign(__assign({}, teamSideObject), { banned: __spreadArray(__spreadArray([], teamSideObject.banned, true), [mapName], false) });
        }
        else if (teamSide === 'teamTwo') {
            room.matchConfig.matchTeamTwo = __assign(__assign({}, teamSideObject), { banned: __spreadArray(__spreadArray([], teamSideObject.banned, true), [mapName], false) });
        }
        var isTimeToChooseSide = (0, functions_1.checkifIsTimeToChooseSide)(room);
        if (isTimeToChooseSide) {
            (0, functions_1.beginChooseSidePhase)(socket, roomId);
        }
        room.matchConfig.matchBannedMaps.push(mapName);
        exports.rooms[exports.rooms.indexOf(room)] = room;
        (0, functions_1.changeMatchTurn)(room);
        socket.to(room.name).emit('mapBanned', mapName);
        (0, functions_1.insertMatchLog)(roomId, { type: 'ban', map: mapName, team: teamSide });
    });
    socket.on('pickSide', function (roomId, mapName, side) {
        console.log('pickSide', roomId, mapName, side);
        var room = (0, functions_1.findRoom)(roomId);
        if (!room) {
            console.log('room not found');
            return socket.emit('roomNotFound', roomId);
        }
        if (!(0, functions_1.isUserAllowedToVeto)(socket, roomId)) {
            console.log('not allowed to veto');
            return socket.emit('notAllowedToVeto');
        }
        var isPickTime = (0, functions_1.checkIfisPickSidePhase)(room);
        if (!isPickTime) {
            console.log('not pick side phase');
            return socket.emit('notPickSidePhase');
        }
        var teamSide = (0, functions_1.getTeamSideByToken)(socket, roomId);
        if (!(0, functions_1.checkMatchTurn)(room, teamSide)) {
            console.log('not your turn');
            return socket.emit('notYourTurn');
        }
        var mapObject = room.matchConfig.matchPickedsMaps.find(function (map) { return map.name === mapName; });
        console.log({ mapObject: mapObject });
        if (mapObject.teamOneSide !== '' && mapObject.teamTwoSide !== '') {
            console.log('side already picked');
            return socket.emit('sideAlreadyPicked', mapName);
        }
        if (teamSide === 'teamOne') {
            mapObject.teamOneSide = side;
            mapObject.teamTwoSide = side === 'attack' ? 'defend' : 'attack';
        }
        else {
            mapObject.teamTwoSide = side;
            mapObject.teamOneSide = side === 'attack' ? 'defend' : 'attack';
        }
        room.matchConfig.matchPickedsMaps[room.matchConfig.matchPickedsMaps.indexOf(mapObject)] = mapObject;
        exports.rooms[exports.rooms.indexOf(room)] = room;
        (0, functions_1.changeMatchTurn)(room);
        (0, functions_1.insertMatchLog)(roomId, {
            type: 'pick',
            map: mapName,
            team: teamSide,
            side: side,
        });
        var maps = room.matchConfig.matchPickedsMaps;
        var notSelected = maps.filter(function (map) {
            return map.teamOneSide === '' && map.teamTwoSide === '';
        });
        if (notSelected.length === 0) {
            endPickSidePhase(socket, roomId);
        }
    });
});
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
